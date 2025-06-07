const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;

const { db, promiseDb } = require('./db');
const accountController = require('./accountController');
const avatarRoutes = require('./routes/avatar');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'uma_string_secreta_muito_forte_e_aleatoria_12345',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessage = req.session.errorMessage;
    res.locals.successMessage = req.session.successMessage;
    delete req.session.errorMessage;
    delete req.session.successMessage;
    next();
});

function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        next(); // Usuário logado, continua para a próxima middleware/rota
    } else {
        req.session.errorMessage = 'Você precisa estar logado para acessar esta página.';
        res.redirect('/login'); // Redireciona para login se não estiver logado
    }
}

function redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
}

// --- Rotas Públicas ---
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/download', (req, res) => {
    res.render('download', { title: 'Download' });
});

app.get('/wiki', (req, res) => {
    res.render('wiki', { title: 'Wiki - Held Items' });
});

app.get('/mapa', (req, res) => {
    res.render('mapa', { title: 'Mapa do Mundo' });
});

app.get('/ranking', async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 50; // Default to 50 players per page
    const currentPage = parseInt(req.query.page) || 1;
    const offset = (currentPage - 1) * pageSize;
    const search = req.query.search ? req.query.search.trim() : '';
    const searchQuery = search ? `%${search}%` : null;
    const rankingType = req.query.type || 'level';

    let connection;

    try {
        connection = await promiseDb.getConnection();

        let totalPlayersCount;
        let players;
        let queryOrder = '';
        let queryWhere = 'WHERE deleted = 0 AND group_id < 2';
        const queryParams = [];

        if (searchQuery) {
            queryWhere += ' AND name LIKE ?';
            queryParams.push(searchQuery);
        }

        if (rankingType === 'level') {
            queryOrder = 'ORDER BY level DESC, experience DESC';
        } else if (rankingType === 'resets') {
            queryOrder = 'ORDER BY resets DESC, level DESC, experience DESC';
        } else {
            queryOrder = 'ORDER BY level DESC, experience DESC';
        }

        const [countResult] = await connection.execute(
            `SELECT COUNT(*) AS total FROM players ${queryWhere}`,
            queryParams
        );
        totalPlayersCount = countResult[0].total;

        const [rankingPlayers] = await connection.execute(
            `SELECT id, account_id, name, level, vocation, experience, resets, deleted, group_id, looktype, lookhead, lookbody, looklegs, lookfeet, sex
             FROM players
             ${queryWhere}
             ${queryOrder}
             LIMIT ? OFFSET ?`,
            [...queryParams, pageSize, offset]
        );

        players = rankingPlayers;
        const totalPages = Math.ceil(totalPlayersCount / pageSize);

        res.render('ranking', {
            title: `Ranking de ${rankingType === 'level' ? 'Nível' : 'Resets'}`,
            players: players,
            currentPage: currentPage,
            totalPages: totalPages,
            pageSize: pageSize,
            totalPlayers: totalPlayersCount,
            search: search,
            rankingType: rankingType,
            user: req.session.user
        });

    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        req.session.errorMessage = 'Erro ao carregar o ranking. Por favor, tente novamente mais tarde.';
        return res.redirect('/');
    } finally {
        if (connection) connection.release();
    }
});

app.get('/character/:name', async (req, res) => {
    const charName = req.params.name;
    let connection;
    try {
        connection = await promiseDb.getConnection();
        const [playerRows] = await connection.execute(
            'SELECT * FROM players WHERE name = ? AND deleted = 0',
            [charName]
        );
        if (playerRows.length > 0) {
            const player = playerRows[0];
            const [accountRows] = await connection.execute(
                'SELECT name FROM accounts WHERE id = ?',
                [player.account_id]
            );
            player.accountName = accountRows.length > 0 ? accountRows[0].name : 'N/A';

            res.render('character', {
                title: player.name,
                player: player,
                user: req.session.user
            });
        } else {
            res.status(404).render('404', { title: 'Jogador Não Encontrado', message: `Jogador "${charName}" não encontrado ou foi deletado.` });
        }
    } catch (error) {
        console.error('Erro ao buscar jogador:', error);
        res.status(500).render('error', { title: 'Erro no Servidor', message: 'Ocorreu um erro ao buscar informações do jogador.' });
    } finally {
        if (connection) connection.release();
    }
});

// --- Rotas de Autenticação ---
app.get('/register', redirectIfLoggedIn, (req, res) => {
    const formData = req.session.formDataStep1;
    delete req.session.formDataStep1;

    res.render('register_step1', {
        title: 'Criar Conta - Etapa 1',
        formData: formData
    });
});

app.get('/register/step2', redirectIfLoggedIn, (req, res) => {
    if (!req.session.registrationData) {
        req.session.errorMessage = 'Por favor, complete a Etapa 1 primeiro.';
        return res.redirect('/register');
    }

    const formData = req.session.formDataStep2;
    delete req.session.formDataStep2;

    res.render('register_step2', {
        title: 'Criar Conta - Etapa 2',
        formData: formData
    });
});

app.post('/register', redirectIfLoggedIn, async (req, res) => {
    const { step, name, email, password, confirm_password, country } = req.body;

    let connection;

    try {
        connection = await promiseDb.getConnection();

        if (step === '1') {
            req.session.formDataStep1 = { name, email };

            if (!name || !email) {
                req.session.errorMessage = 'Por favor, preencha todos os campos.';
                return res.redirect('/register');
            }

            if (!/\S+@\S+\.\S+/.test(email)) {
                req.session.errorMessage = 'Por favor, insira um email válido.';
                return res.redirect('/register');
            }

            const [existingUsers] = await connection.execute(
                'SELECT id, name, email FROM accounts WHERE name = ? OR email = ?',
                [name, email]
            );

            if (existingUsers.length > 0) {
                const nameExists = existingUsers.some(user => user.name === name);
                const emailExists = existingUsers.some(user => user.email === email);

                if (nameExists && emailExists) {
                    req.session.errorMessage = 'Nome de conta e Email já cadastrados.';
                } else if (nameExists) {
                    req.session.errorMessage = 'Nome de conta já cadastrado.';
                } else if (emailExists) {
                    req.session.errorMessage = 'Email já cadastrado.';
                }
                return res.redirect('/register');
            }

            req.session.registrationData = { name, email };
            delete req.session.formDataStep1;
            return res.redirect('/register/step2');

        } else if (step === '2') {
            const registrationData = req.session.registrationData;

            if (!registrationData) {
                req.session.errorMessage = 'Sessão expirada ou Etapa 1 incompleta. Por favor, comece novamente.';
                return res.redirect('/register');
            }

            req.session.formDataStep2 = { country };

            if (!password || !confirm_password || !country) {
                req.session.errorMessage = 'Por favor, preencha todos os campos.';
                return res.redirect('/register/step2');
            }

            if (password !== confirm_password) {
                req.session.errorMessage = 'As senhas não coincidem.';
                return res.redirect('/register/step2');
            }

            if (!accountController.isPasswordStrong(password)) {
                req.session.errorMessage = 'A senha não atende aos requisitos de segurança (Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial).';
                return res.redirect('/register/step2');
            }

            const { name, email } = registrationData;
            const hashedPassword = accountController.sha1(password);
            const generatedKey = crypto.randomBytes(64).toString('hex');
            const creationTimestamp = Math.floor(Date.now() / 1000);

            const defaultValues = {
                change_pass: 0, salt: '', premdays: 0, lastday: 0, blocked: 0, warnings: 0,
                group_id: 1, type: 1, accept_news: 0, event_points: 0, language: 0,
                vip_time: 0, lang_id: 0, shop_points: 0, userInfoProcessed: 0, rcoins: 0
            };

            await connection.execute(
                `INSERT INTO accounts (name, email, password, \`key\`, location, created,
                 change_pass, salt, premdays, lastday, blocked, warnings, group_id, type,
                 accept_news, event_points, language, vip_time, lang_id, shop_points, userInfoProcessed, rcoins
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, hashedPassword, generatedKey, country, creationTimestamp,
                    defaultValues.change_pass, defaultValues.salt, defaultValues.premdays, defaultValues.lastday, defaultValues.blocked,
                    defaultValues.warnings, defaultValues.group_id, defaultValues.type, defaultValues.accept_news,
                    defaultValues.event_points, defaultValues.language, defaultValues.vip_time, defaultValues.lang_id,
                    defaultValues.shop_points, defaultValues.userInfoProcessed, defaultValues.rcoins
                ]
            );

            delete req.session.registrationData;
            delete req.session.formDataStep2;

            req.session.successMessage = 'Conta criada com sucesso! Faça login para continuar.';
            return res.redirect('/login');

        } else {
            req.session.errorMessage = 'Etapa de registro inválida.';
            return res.redirect('/register');
        }

    } catch (error) {
        console.error('Erro durante o registro:', error);
        if (step === '2' && req.session.registrationData) {
            req.session.errorMessage = 'Erro ao finalizar o registro. Tente novamente mais tarde.';
            return res.redirect('/register/step2');
        } else {
            req.session.errorMessage = 'Erro ao processar a Etapa 1. Tente novamente mais tarde.';
            return res.redirect('/register');
        }

    } finally {
        if (connection) connection.release();
    }
});

app.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/login', redirectIfLoggedIn, async (req, res) => {
    const result = await accountController.login(req);

    if (result.success) {
        req.session.user = {
            id: result.user.id,
            name: result.user.name,
            group_id: result.user.group_id
        };
        req.session.successMessage = `Bem-vindo de volta, ${result.user.name}!`;
        return res.redirect('/dashboard');
    } else {
        req.session.errorMessage = result.message;
        return res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            req.session.errorMessage = 'Erro ao fazer logout. Tente novamente.';
            return res.redirect('/dashboard');
        }
        console.log('Usuário deslogado.');
        return res.redirect('/login');
    });
});

// --- Rotas do Dashboard e Personagens (Requer Login) ---
app.get('/dashboard', requireLogin, async (req, res) => {
    const accountId = req.session.user.id;
    let connection;

    try {
        connection = await promiseDb.getConnection();

        const [accountRows] = await connection.query(
            'SELECT id, name, premdays, shop_points, group_id, rcoins FROM accounts WHERE id = ?',
            [accountId]
        );
        if (accountRows.length === 0) {
            req.session.destroy();
            req.session.errorMessage = 'Sua conta não foi encontrada.';
            return res.redirect('/login');
        }
        const account = accountRows[0];
        account.vip = account.premdays;
        account.rcoins = account.shop_points;

        const [characterRows] = await connection.query(
            'SELECT id, name, sex, picture, level, online, created, resets, looktype, lookhead, lookbody, looklegs, lookfeet FROM players WHERE account_id = ? AND deleted = 0',
            [accountId]
        );

        const characters = characterRows;
        const maxPlayersPerAccount = 5;
        const canCreateCharacter = characters.length < maxPlayersPerAccount;

        const backgroundsDir = path.join(__dirname, 'public', 'assets', 'images', 'characters', 'backgrounds');
        let backgroundFiles = [];
        try {
            const files = await fs.readdir(backgroundsDir);
            backgroundFiles = files
                .filter(file => /^background_\d+\.png$/i.test(file))
                .map(file => {
                    const match = file.match(/^background_(\d+)\.png$/i);
                    return match ? parseInt(match[1]) : null;
                })
                .filter(number => number !== null)
                .sort((a, b) => a - b);
        } catch (err) {
            console.error('Erro ao ler diretório de backgrounds:', err);
            backgroundFiles = [];
        }

        res.render('dashboard', {
            title: 'Dashboard',
            account: account,
            characters: characters,
            canCreateCharacter: canCreateCharacter,
            maxPlayersPerAccount: maxPlayersPerAccount,
            user: req.session.user
        });

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        req.session.errorMessage = 'Erro ao carregar informações do dashboard. Por favor, tente novamente mais tarde.';
        return res.redirect('/');
    } finally {
        if (connection) connection.release();
    }
});

// --- API de Personagens ---
app.post('/api/characters/create', requireLogin, accountController.createCharacter);
app.get('/api/characters/checkname', accountController.checkCharacterName);
app.post('/api/characters/delete', requireLogin, accountController.deleteCharacter);

// --- Usar a rota de avatar ---
app.use('/', avatarRoutes);

// --- Tratamento de Erros e 404 ---
// Catch-all for 404 pages - This should be the last route handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Página Não Encontrada' });
});

// Global error handler - This should be the very last middleware
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).render('error', { title: 'Erro no Servidor', message: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
});

<<<<<<< Updated upstream
=======
// Catch-all for 404 pages
app.use((req, res) => {
    res.status(404).render('404', { title: 'Página Não Encontrada' });
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).render('error', { title: 'Erro no Servidor', message: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
});




=======
>>>>>>> Stashed changes
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
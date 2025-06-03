
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const { db, promiseDb } = require('./db');
const accountController = require('./accountController');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'uma_string_secreta_muito_forte_e_aleatoria_12345',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
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
    next();
  } else {
    req.session.errorMessage = 'Você precisa estar logado para acessar esta página.';
    res.redirect('/login');
  }
}

function redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        res.redirect('/dashboard');
    } else {
        next();
    }
}

const { sha1, isPasswordStrong } = require('./accountController');

app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

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

            if (!isPasswordStrong(password)) {
                req.session.errorMessage = 'A senha não atende aos requisitos de segurança (Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial).';
                return res.redirect('/register/step2');
            }

            const { name, email } = registrationData;

            const hashedPassword = sha1(password);
            const generatedKey = require('crypto').randomBytes(64).toString('hex');
            const creationTimestamp = Math.floor(Date.now() / 1000);

             const defaultValues = {
                 change_pass: 0, salt: '', premdays: 0, lastday: 0, blocked: 0, warnings: 0,
                 group_id: 1, type: 1, accept_news: 0, event_points: 0, language: 0,
                 vip_time: 0, lang_id: 0, shop_points: 0, userInfoProcessed: 0
             };

            const [result] = await connection.execute(
                `INSERT INTO accounts (name, email, password, \`key\`, location, created,
                 change_pass, salt, premdays, lastday, blocked, warnings, group_id, type,
                 accept_news, event_points, language, vip_time, lang_id, shop_points, userInfoProcessed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, hashedPassword, generatedKey, country, creationTimestamp,
                 defaultValues.change_pass, defaultValues.salt, defaultValues.premdays, defaultValues.lastday, defaultValues.blocked,
                 defaultValues.warnings, defaultValues.group_id, defaultValues.type, defaultValues.accept_news,
                 defaultValues.event_points, defaultValues.language, defaultValues.vip_time, defaultValues.lang_id,
                 defaultValues.shop_points, defaultValues.userInfoProcessed
                ]
            );

            console.log('Novo usuário registrado com ID:', result.insertId);

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
        if (req.session.registrationData) {
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

app.get('/dashboard', requireLogin, async (req, res) => {
  const accountId = req.session.user.id;
  const accountName = req.session.user.name;
  const accountGroupId = req.session.user.group_id;

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
        'SELECT id, name, sex, picture, level, online, created, resets FROM players WHERE account_id = ? AND deleted = 0',
        [accountId]
    );

    const characters = characterRows;

    const maxPlayersPerAccount = 5;
    const canCreateCharacter = characters.length < maxPlayersPerAccount;


    res.render('dashboard', {
        title: 'Dashboard',
        account: account,
        characters: characters,
        group_id: accountGroupId,
        canCreateCharacter: canCreateCharacter,
        maxPlayersPerAccount: maxPlayersPerAccount
    });

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    req.session.errorMessage = 'Erro ao carregar informações do dashboard. Por favor, tente novamente mais tarde.';
    return res.redirect('/');
  } finally {
    if (connection) connection.release();
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir a sessão:', err);
    }
    console.log('Usuário deslogado.');
    return res.redirect('/login');
  });
});

app.get('/ranking', async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 20;
    const currentPage = parseInt(req.query.page) || 1;
    const offset = (currentPage - 1) * pageSize;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const rankingType = req.query.type || 'level';

    let connection;

    try {
        connection = await promiseDb.getConnection();

        let totalPlayersCount;
        let players;
        let queryOrder = '';
        let queryWhere = 'WHERE deleted = 0 AND group_id < 2';
        const queryParams = [];

        if (search) {
            queryWhere += ' AND name LIKE ?';
            queryParams.push(search);
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
            `SELECT id, name, level, vocation, experience, resets, deleted, group_id
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
            search: req.query.search || '',
            rankingType: rankingType
        });

    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        req.session.errorMessage = 'Erro ao carregar o ranking.';
        return res.redirect('/');
    } finally {
        if (connection) connection.release();
    }
});

app.post('/api/characters/create', requireLogin, accountController.createCharacter);
app.get('/api/characters/checkname', accountController.checkCharacterName);
app.post('/api/characters/delete', requireLogin, accountController.deleteCharacter);

app.use((req, res) => {
    res.status(404).send('Página não encontrada');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
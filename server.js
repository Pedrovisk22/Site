const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises; // Keep this as promises for async/await

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
        return res.redirect('/dashboard');
    }
    next();
}

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

// Mapeamento de nomes de países para códigos ISO 3166-1 alpha-2
const countryNameToCodeMap = {
    'Afeganistão': 'AF', 'África do Sul': 'ZA', 'Albânia': 'AL', 'Alemanha': 'DE',
    'Andorra': 'AD', 'Angola': 'AO', 'Anguilla': 'AI', 'Antártida': 'AQ',
    'Antígua e Barbuda': 'AG', 'Arábia Saudita': 'SA', 'Argélia': 'DZ',
    'Argentina': 'AR', 'Armênia': 'AM', 'Aruba': 'AW', 'Austrália': 'AU',
    'Áustria': 'AT', 'Azerbaijão': 'AZ', 'Bahamas': 'BS', 'Bahrein': 'BH',
    'Bangladesh': 'BD', 'Barbados': 'BB', 'Belarus': 'BY', 'Bélgica': 'BE',
    'Belize': 'BZ', 'Benin': 'BJ', 'Bermudas': 'BM', 'Bolívia': 'BO',
    'Bósnia e Herzegovina': 'BA', 'Botsuana': 'BW', 'Brasil': 'BR', 'Brunei': 'BN',
    'Bulgária': 'BG', 'Burkina Faso': 'BF', 'Burundi': 'BI', 'Butão': 'BT',
    'Cabo Verde': 'CV', 'Camboja': 'KH', 'Canadá': 'CA', 'Catar': 'QA',
    'Cazaquistão': 'KZ', 'República Centro-Africana': 'CF', 'Chade': 'TD',
    'Chile': 'CL', 'China': 'CN', 'Chipre': 'CY', 'Colômbia': 'CO',
    'Comores': 'KM', 'República do Congo': 'CG', 'República Democrática do Congo': 'CD',
    'Coreia do Norte': 'KP', 'Coreia do Sul': 'KR', 'Costa do Marfim': 'CI',
    'Costa Rica': 'CR', 'Croácia': 'HR', 'Cuba': 'CU', 'Dinamarca': 'DK',
    'Djibouti': 'DJ', 'Dominica': 'DM', 'Egito': 'EG', 'El Salvador': 'SV',
    'Emirados Árabes Unidos': 'AE', 'Equador': 'EC', 'Eritreia': 'ER',
    'Eslováquia': 'SK', 'Eslovênia': 'SI', 'Espanha': 'ES', 'Estados Unidos': 'US',
    'Estônia': 'EE', 'Etiópia': 'ET', 'Fiji': 'FJ', 'Filipinas': 'PH',
    'Finlândia': 'FI', 'França': 'FR', 'Gabão': 'GA', 'Gâmbia': 'GM',
    'Gana': 'GH', 'Geórgia': 'GE', 'Gibraltar': 'GI', 'Granada': 'GD',
    'Grécia': 'GR', 'Groenlândia': 'GL', 'Guadalupe': 'GP', 'Guam': 'GU',
    'Guatemala': 'GT', 'Guiana': 'GY', 'Guiana Francesa': 'GF', 'Guiné': 'GN',
    'Guiné-Bissau': 'GW', 'Guiné Equatorial': 'GQ', 'Haiti': 'HT',
    'Honduras': 'HN', 'Hong Kong': 'HK', 'Hungria': 'HU', 'Iêmen': 'YE',
    'Ilha Bouvet': 'BV', 'Ilha Christmas': 'CX', 'Ilha Norfolk': 'NF',
    'Ilhas Aland': 'AX', 'Ilhas Cayman': 'KY', 'Ilhas Cocos (Keeling)': 'CC',
    'Ilhas Cook': 'CK', 'Ilhas Feroe': 'FO', 'Ilhas Malvinas': 'FK',
    'Ilhas Marianas do Norte': 'MP', 'Ilhas Marshall': 'MH', 'Ilhas Pitcairn': 'PN',
    'Ilhas Salomão': 'SB', 'Ilhas Turks e Caicos': 'TC', 'Ilhas Menores Distantes dos Estados Unidos': 'UM',
    'Ilhas Virgens Britânicas': 'VG', 'Ilhas Virgens Americanas': 'VI', 'Ilhas Heard e McDonald': 'HM',
    'Irlanda': 'IE', 'Irã': 'IR', 'Iraque': 'IQ', 'Islândia': 'IS',
    'Israel': 'IL', 'Itália': 'IT', 'Jamaica': 'JM', 'Japão': 'JP',
    'Jordânia': 'JO', 'Kuwait': 'KW', 'Laos': 'LA', 'Lesoto': 'LS',
    'Letônia': 'LV', 'Líbano': 'LB', 'Libéria': 'LR', 'Líbia': 'LY',
    'Liechtenstein': 'LI', 'Lituânia': 'LT', 'Luxemburgo': 'LU', 'Macau': 'MO',
    'Macedônia do Norte': 'MK', 'Madagascar': 'MG', 'Malásia': 'MY',
    'Malawi': 'MW', 'Maldivas': 'MV', 'Mali': 'ML', 'Malta': 'MT',
    'Martinica': 'MQ', 'Mauritânia': 'MR', 'Maurício': 'MU', 'Mayotte': 'YT',
    'México': 'MX', 'Micronésia': 'FM', 'Moçambique': 'MZ', 'Moldávia': 'MD',
    'Mônaco': 'MC', 'Mongólia': 'MN', 'Montenegro': 'ME', 'Montserrat': 'MS',
    'Marrocos': 'MA', 'Mianmar': 'MM', 'Namíbia': 'NA', 'Nauru': 'NR',
    'Nepal': 'NP', 'Países Baixos': 'NL', 'Antilhas Holandesas': 'AN',
    'Nova Caledônia': 'NC', 'Nova Zelândia': 'NZ', 'Nicarágua': 'NI',
    'Níger': 'NE', 'Nigéria': 'NG', 'Niue': 'NU', 'Noruega': 'NO',
    'Omã': 'OM', 'Palau': 'PW', 'Panamá': 'PA', 'Papua Nova Guiné': 'PG',
    'Paquistão': 'PK', 'Paraguai': 'PY', 'Peru': 'PE', 'Polinésia Francesa': 'PF',
    'Polônia': 'PL', 'Porto Rico': 'PR', 'Portugal': 'PT', 'Quênia': 'KE',
    'Quirguistão': 'KG', 'Kiribati': 'KI', 'Reino Unido': 'GB', 'República Tcheca': 'CZ',
    'República Dominicana': 'DO', 'Reunião': 'RE', 'Romênia': 'RO', 'Ruanda': 'RW',
    'Rússia': 'RU', 'Saara Ocidental': 'EH', 'Saint Pierre e Miquelon': 'PM',
    'Samoa': 'WS', 'Samoa Americana': 'AS', 'San Marino': 'SM', 'Santa Helena': 'SH',
    'Santa Lúcia': 'LC', 'São Cristóvão e Nevis': 'KN', 'São Martinho (Parte Francesa)': 'MF',
    'São Martinho (Parte Holandesa)': 'SX', 'São Tomé e Príncipe': 'ST',
    'São Vicente e Granadinas': 'VC', 'Senegal': 'SN', 'Serra Leoa': 'SL',
    'Sérvia': 'RS', 'Singapura': 'SG', 'Síria': 'SY', 'Somália': 'SO',
    'Sri Lanka': 'LK', 'Eswatini': 'SZ', 'Sudão': 'SD', 'Sudão do Sul': 'SS',
    'Suécia': 'SE', 'Suíça': 'CH', 'Suriname': 'SR', 'Svalbard e Jan Mayen': 'SJ',
    'Tajiquistão': 'TJ', 'Tailândia': 'TH', 'Taiwan': 'TW', 'Tanzânia': 'TZ',
    'Terras Austrais Francesas': 'TF', 'Território Britânico do Oceano Índico': 'IO',
    'Timor-Leste': 'TL', 'Togo': 'TG', 'Tokelau': 'TK', 'Tonga': 'TO',
    'Trinidad e Tobago': 'TT', 'Tunísia': 'TN', 'Turcomenistão': 'TM', 'Turquia': 'TR',
    'Tuvalu': 'TV', 'Ucrânia': 'UA', 'Uganda': 'UG', 'Uruguai': 'UY',
    'Uzbequistão': 'UZ', 'Vanuatu': 'VU', 'Cidade do Vaticano': 'VA',
    'Venezuela': 'VE', 'Vietnã': 'VN', 'Wallis e Futuna': 'WF', 'Zâmbia': 'ZM',
    'Zimbábue': 'ZW'
};

function getFlagCodeForServer(countryName) {
    return countryNameToCodeMap[countryName] || 'BR'; // Padrão para BR se não encontrar
}

app.get('/ranking', async (req, res) => {
    const availablePageSizes = [5, 10, 20, 50, 100];

    let pageSize = parseInt(req.query.pageSize, 10) || availablePageSizes[0];
    if (!availablePageSizes.includes(pageSize)) {
        pageSize = availablePageSizes[0];
    }

    const currentPage = parseInt(req.query.page, 10) || 1;
    const offset = (currentPage - 1) * pageSize;
    const search = req.query.search ? req.query.search.trim() : '';
    const rankingType = req.query.type || 'level';

    let connection;

    try {
        connection = await promiseDb.getConnection();

        let queryWhere = 'WHERE p.deleted = 0 AND p.group_id < 2';
        const selectParams = [];
        const countParams = [];

        if (search) {
            queryWhere += ' AND p.name LIKE ?';
            const searchQueryValue = `%${search}%`;
            selectParams.push(searchQueryValue);
            countParams.push(searchQueryValue);
        }

        let queryOrder = 'ORDER BY p.level DESC, p.experience DESC';
        if (rankingType === 'resets') {
            queryOrder = 'ORDER BY p.resets DESC, p.level DESC, p.experience DESC';
        }

        const countSql = `SELECT COUNT(*) AS total FROM players p ${queryWhere}`;
        const [countResult] = await connection.execute(countSql, countParams);
        const totalPlayersCount = countResult[0].total;

        const selectSql = `
            SELECT
                p.id, p.account_id, p.name, p.level, p.vocation, p.experience,
                p.resets, p.deleted, p.group_id, p.looktype, p.lookhead, p.lookbody,
                p.looklegs, p.lookfeet, p.sex, p.background, p.isPrivate, a.location
            FROM players p
            JOIN accounts a ON p.account_id = a.id
            ${queryWhere}
            ${queryOrder}
            LIMIT ? OFFSET ?`;

        selectParams.push(pageSize, offset);

        const [players] = await connection.execute(selectSql, selectParams);

        // Processar jogadores para adicionar o código da bandeira
        const processedPlayers = players.map(player => {
            const flagCode = getFlagCodeForServer(player.location); // Obtém o código da bandeira
            return {
                ...player,
                flagCode: flagCode // Adiciona a propriedade flagCode ao objeto do jogador
            };
        });

        const totalPages = Math.ceil(totalPlayersCount / pageSize);

        const responseData = {
            players: processedPlayers, // Envia os jogadores processados
            currentPage: currentPage,
            totalPages: totalPages,
            pageSize: pageSize,
            search: search,
            rankingType: rankingType,
        };

        const isAjax = req.xhr || req.headers.accept.indexOf('json') > -1;

        if (isAjax) {
            res.json(responseData);
        } else {
            res.render('ranking', {
                ...responseData,
                title: `Ranking de ${rankingType === 'level' ? 'Nível' : 'Resets'}`,
                availablePageSizes: availablePageSizes,
                user: req.session.user
            });
        }
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        if (!req.xhr) {
            req.session.errorMessage = 'Erro ao carregar o ranking.';
            return res.redirect('/');
        } else {
            res.status(500).json({ message: 'Erro ao carregar dados do ranking.' });
        }
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
            'SELECT id, name, sex, level, online, created, resets, looktype, lookhead, lookbody, looklegs, lookfeet, background, isPrivate FROM players WHERE account_id = ? AND deleted = 0',
            [accountId]
        );

        const characters = characterRows;
        const maxPlayersPerAccount = 5;
        const canCreateCharacter = characters.length < maxPlayersPerAccount;

        let backgroundFiles = [];
        const backgroundsDirPath = path.join(__dirname, 'public', 'assets', 'images', 'characters', 'backgrounds');

        try {
            // FIX: Use await with fs.readdir
            const files = await fs.readdir(backgroundsDirPath);
            backgroundFiles = files
                .filter(file => file.startsWith('background_') && file.endsWith('.png'))
                .map(file => parseInt(file.replace('background_', '').replace('.png', ''), 10))
                .filter(num => !isNaN(num))
                .sort((a, b) => a - b);
        } catch (readDirError) {
            console.error('Erro ao ler o diretório de backgrounds:', readDirError);
            // Se houver um erro, backgroundFiles permanecerá como um array vazio, o que é seguro.
        }

        res.render('dashboard', {
            title: 'Dashboard',
            account: account,
            characters: characters,
            canCreateCharacter: canCreateCharacter,
            maxPlayersPerAccount: maxPlayersPerAccount,
            user: req.session.user,
            backgroundFiles: backgroundFiles // Passando a variável backgroundFiles para o EJS
        });

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        req.session.errorMessage = 'Erro ao carregar informações do dashboard. Por favor, tente novamente mais tarde.';
        return res.redirect('/');
    } finally {
        if (connection) connection.release();
    }
});

// New PUT route for character updates (background and isPrivate)
app.put('/api/characters/:charId', requireLogin, async (req, res) => {
    const charId = req.params.charId;
    const accountId = req.session.user.id;
    const { background, isPrivate } = req.body;

    let connection;
    try {
        connection = await promiseDb.getConnection();

        // Check if character belongs to the logged-in user
        const [characterCheck] = await connection.execute(
            'SELECT account_id FROM players WHERE id = ? AND deleted = 0',
            [charId]
        );

        if (characterCheck.length === 0 || characterCheck[0].account_id !== accountId) {
            return res.status(403).json({ success: false, message: 'Não autorizado ou personagem não encontrado.' });
        }

        if (background !== undefined) {
            // Update background
            await connection.execute(
                'UPDATE players SET background = ? WHERE id = ?',
                [background, charId]
            );
            return res.json({ success: true, message: 'Background atualizado com sucesso!' });
        } else if (isPrivate !== undefined) {
            // Update isPrivate status
            const privateStatus = isPrivate ? 1 : 0;
            await connection.execute(
                'UPDATE players SET isPrivate = ? WHERE id = ?',
                [privateStatus, charId]
            );
            return res.json({ success: true, message: `Privacidade do perfil ${isPrivate ? 'ativada' : 'desativada'}!` });
        } else {
            return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar fornecido.' });
        }

    } catch (error) {
        console.error('Erro ao atualizar personagem:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao atualizar personagem.' });
    } finally {
        if (connection) connection.release();
    }
});


app.post('/api/characters/create', requireLogin, accountController.createCharacter);
app.get('/api/characters/checkname', accountController.checkCharacterName);
app.post('/api/characters/delete', requireLogin, accountController.deleteCharacter);

app.use('/', avatarRoutes);

app.use((req, res) => {
    res.status(404).render('404', { title: 'Página Não Encontrada' });
});

app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).render('error', { title: 'Erro no Servidor', message: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
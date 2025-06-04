// server.js

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

// --- Importações Existentes ---
const { db, promiseDb } = require('./db');
const accountController = require('./accountController'); // Certifique-se que accountController está definido/importado corretamente
const avatarRoutes = require('./routes/avatar');


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
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Middleware para disponibilizar informações do usuário logado e mensagens flash no template
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Passa o objeto user para o template
    res.locals.errorMessage = req.session.errorMessage;
    res.locals.successMessage = req.session.successMessage;
    delete req.session.errorMessage;
    delete req.session.successMessage;
    next();
});

// Middleware para proteger rotas que exigem login
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    next(); // Usuário logado, continua para a próxima middleware/rota
  } else {
    req.session.errorMessage = 'Você precisa estar logado para acessar esta página.';
    res.redirect('/login'); // Redireciona para login se não estiver logado
  }
}

// Middleware para redirecionar se já estiver logado (para rotas como login, register)
function redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        // Se o usuário tentar acessar /login ou /register estando logado, redireciona
        return res.redirect('/dashboard'); // Redireciona para o dashboard ou outra página
    }
    next(); // Não logado, continua
}

// --- Rotas Existentes ---
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

            if (!accountController.isPasswordStrong(password)) {
                req.session.errorMessage = 'A senha não atende aos requisitos de segurança (Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial).';
                return res.redirect('/register/step2');
            }

            const { name, email } = registrationData;

            const hashedPassword = accountController.sha1(password); // Usando SHA1 conforme original
            const generatedKey = require('crypto').randomBytes(64).toString('hex');
            const creationTimestamp = Math.floor(Date.now() / 1000);

             // Valores padrão para novas contas
             const defaultValues = {
                 change_pass: 0, salt: '', premdays: 0, lastday: 0, blocked: 0, warnings: 0,
                 group_id: 1, type: 1, accept_news: 0, event_points: 0, language: 0,
                 vip_time: 0, lang_id: 0, shop_points: 0, userInfoProcessed: 0, rcoins: 0
             };

            const [result] = await connection.execute(
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

            console.log('Novo usuário registrado com ID:', result.insertId);

            // Clear registration data from session
            delete req.session.registrationData;
            delete req.session.formDataStep2;

            req.session.successMessage = 'Conta criada com sucesso! Faça login para continuar.';
            return res.redirect('/login');

        } else {
            // Invalid step provided
            req.session.errorMessage = 'Etapa de registro inválida.';
            return res.redirect('/register');
        }

    } catch (error) {
        console.error('Erro durante o registro:', error);
         // Preserve form data on error if possible and redirect back to the relevant step
         if (step === '2' && req.session.registrationData) {
              req.session.errorMessage = 'Erro ao finalizar o registro. Tente novamente mais tarde.';
              // req.session.formDataStep2 is already set above
              return res.redirect('/register/step2');
          } else {
              req.session.errorMessage = 'Erro ao processar a Etapa 1. Tente novamente mais tarde.';
              // req.session.formDataStep1 is already set above
              return res.redirect('/register');
          }

    } finally {
        if (connection) connection.release(); // Release connection
    }
});

app.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', { title: 'Login' });
});

app.post('/login', redirectIfLoggedIn, async (req, res) => {
    const result = await accountController.login(req);

    if (result.success) {
        // Store relevant user info in session
        req.session.user = {
            id: result.user.id, // Account ID
            name: result.user.name, // Account Name
            group_id: result.user.group_id
            // Add other info if needed, like character list for dashboard
        };
        req.session.successMessage = `Bem-vindo de volta, ${result.user.name}!`;
        return res.redirect('/dashboard'); // Redirect to dashboard or home
    } else {
        req.session.errorMessage = result.message;
        return res.redirect('/login'); // Stay on login page with error
    }
});

app.get('/dashboard', requireLogin, async (req, res) => {
  const accountId = req.session.user.id;
  const accountName = req.session.user.name; // Not strictly needed here, but good practice
  const accountGroupId = req.session.user.group_id; // Not strictly needed here, but good practice

  let connection;

  try {
    connection = await promiseDb.getConnection();

    // Fetch account details - ensure fields match your DB schema
    const [accountRows] = await connection.query(
        'SELECT id, name, premdays, shop_points, group_id, rcoins FROM accounts WHERE id = ?',
        [accountId]
    );
    if (accountRows.length === 0) {
        // Account not found, something is wrong with the session ID
        req.session.destroy(); // Destroy session
        req.session.errorMessage = 'Sua conta não foi encontrada.';
        return res.redirect('/login'); // Redirect to login
    }
    const account = accountRows[0];
     // Map database names to potentially different display names if necessary
      account.vip = account.premdays; // Example mapping as used in EJS
      account.rcoins = account.shop_points; // Example mapping as used in EJS

    const [characterRows] = await connection.query(
        'SELECT id, name, sex, picture, level, online, created, resets, looktype, lookhead, lookbody, looklegs, lookfeet FROM players WHERE account_id = ? AND deleted = 0',
        [accountId]
    );

    const characters = characterRows; // Array of characters

    const maxPlayersPerAccount = 5; // Example limit
    const canCreateCharacter = characters.length < maxPlayersPerAccount;


    res.render('dashboard', {
        title: 'Dashboard',
        account: account, // Pass account details
        characters: characters, // Pass characters list
        // group_id: accountGroupId, // Already available in account object, might remove redundant pass
        canCreateCharacter: canCreateCharacter,
        maxPlayersPerAccount: maxPlayersPerAccount,
        user: req.session.user // Make user object available for general header/footer includes
    });

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    req.session.errorMessage = 'Erro ao carregar informações do dashboard. Por favor, tente novamente mais tarde.';
    return res.redirect('/'); // Redirect to home or error page
  } finally {
    if (connection) connection.release(); // Release connection
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir a sessão:', err);
      // Optionally handle error, maybe keep user logged in or show a message
      req.session.errorMessage = 'Erro ao fazer logout. Tente novamente.';
      return res.redirect('/dashboard'); // Or stay on current page
    }
    console.log('Usuário deslogado.');
    // Successful logout, redirect
    return res.redirect('/login'); // Redirect to login or home
  });
});

app.get('/ranking', async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 50; // Default to 50 players per page
    const currentPage = parseInt(req.query.page) || 1;
    const offset = (currentPage - 1) * pageSize;
    // Sanitize search input to prevent SQL injection if not using prepared statements securely (promiseDb does this)
    const search = req.query.search ? req.query.search.trim() : ''; // Trim whitespace
    const searchQuery = search ? `%${search}%` : null; // Use for LIKE clause
    const rankingType = req.query.type || 'level'; // Default to level ranking

    let connection;

    try {
        connection = await promiseDb.getConnection();

        let totalPlayersCount;
        let players;
        let queryOrder = '';
        // Base WHERE clause: not deleted, group_id less than 2 (assuming group_id 1 = player)
        let queryWhere = 'WHERE deleted = 0 AND group_id < 2';
        const queryParams = [];

        if (searchQuery) {
            queryWhere += ' AND name LIKE ?';
            queryParams.push(searchQuery);
        }

        if (rankingType === 'level') {
            queryOrder = 'ORDER BY level DESC, experience DESC';
        } else if (rankingType === 'resets') {
            queryOrder = 'ORDER BY resets DESC, level DESC, experience DESC'; // Order by resets first
        } else {
            // Default or invalid type
            queryOrder = 'ORDER BY level DESC, experience DESC';
        }

        // Count total players matching criteria
        const [countResult] = await connection.execute(
            `SELECT COUNT(*) AS total FROM players ${queryWhere}`,
            queryParams
        );
        totalPlayersCount = countResult[0].total;

        // Fetch players for the current page and ranking type
        const [rankingPlayers] = await connection.execute(
            `SELECT id, account_id, name, level, vocation, experience, resets, deleted, group_id, looktype, lookhead, lookbody, looklegs, lookfeet, sex

             FROM players
             ${queryWhere}
             ${queryOrder}
             LIMIT ? OFFSET ?`,
            [...queryParams, pageSize, offset] // Append limit and offset parameters
        );

        players = rankingPlayers; // Array of player objects

        const totalPages = Math.ceil(totalPlayersCount / pageSize);

        res.render('ranking', {
            title: `Ranking de ${rankingType === 'level' ? 'Nível' : 'Resets'}`,
            players: players, // Pass players data
            currentPage: currentPage,
            totalPages: totalPages,
            pageSize: pageSize, // Pass pageSize back for frontend JS
            totalPlayers: totalPlayersCount,
            search: search, // Pass actual search term back
            rankingType: rankingType, // Pass ranking type back
            user: req.session.user // Pass logged-in user object for highlight
        });

    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        req.session.errorMessage = 'Erro ao carregar o ranking. Por favor, tente novamente mais tarde.';
        return res.redirect('/'); // Redirect to home on error
    } finally {
        if (connection) connection.release(); // Release connection
    }
});


app.post('/api/characters/create', requireLogin, accountController.createCharacter);
app.get('/api/characters/checkname', accountController.checkCharacterName); // Keep public if needed for registration
app.post('/api/characters/delete', requireLogin, accountController.deleteCharacter);


app.get('/download', (req, res) => {
    res.render('download', { title: 'Download' });
});

app.get('/wiki', (req, res) => {
    res.render('wiki', { title: 'Wiki - Held Items' });
});

// Example route for individual character page (optional but good for ranking links)
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
             // Fetch account info if needed for account-specific details on character page
            const [accountRows] = await connection.execute(
                 'SELECT name FROM accounts WHERE id = ?',
                 [player.account_id]
            );
            player.accountName = accountRows.length > 0 ? accountRows[0].name : 'N/A'; // Add account name


            res.render('character', {
                title: player.name,
                player: player, // Pass the full player object including look data
                user: req.session.user // Pass user for header/footer
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


// --- Usar a nova rota de avatar ---
app.use('/', avatarRoutes);


// Catch-all for 404 pages
app.use((req, res) => {
    res.status(404).render('404', { title: 'Página Não Encontrada' });
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).render('error', { title: 'Erro no Servidor', message: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
});

// Catch-all for 404 pages
app.use((req, res) => {
    res.status(404).render('404', { title: 'Página Não Encontrada' });
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).render('error', { title: 'Erro no Servidor', message: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
});




app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
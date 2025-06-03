// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto'); // Módulo nativo para SHA1
const db = require('./db'); // Importa o módulo de conexão do DB

const app = express();
const port = 3000; // Ou outra porta que você preferir

// --- Middleware Setup ---
app.set('view engine', 'ejs'); // Configura EJS como motor de template
app.set('views', path.join(__dirname, 'views')); // Define o diretório das views

// Servir arquivos estáticos (CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Configurar body-parser para ler dados de formulário
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Para caso use JSON no futuro

// Configurar express-session
// ATENÇÃO: Use uma string secreta forte e única!
app.use(session({
  secret: 'uma_string_secreta_muito_forte_e_aleatoria_12345', // Mude para algo único!
  resave: false, // Não salva a sessão de volta para o armazenamento se não for modificada
  saveUninitialized: false, // Não salva sessões novas que ainda não foram modificadas
  cookie: { secure: false } // true em HTTPS, false em HTTP local (para desenvolvimento)
}));

// Middleware para passar o usuário da sessão para todas as views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});


// Middleware para proteger rotas (verifica se o usuário está logado)
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    // Usuário logado, continua para a próxima função da rota
    next();
  } else {
    // Usuário não logado, redireciona para a página de login
    req.session.errorMessage = 'Você precisa estar logado para acessar esta página.'; // Opcional
    res.redirect('/login');
  }
}

// Middleware para redirecionar usuário logado de login/register
function redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        res.redirect('/dashboard'); // Ou para a home ou outra página principal
    } else {
        next();
    }
}

// Função para gerar uma chave aleatória (exemplo simples)
function generateKey() {
    // Gera uma string hexadecimal aleatória de 64 bytes (128 caracteres hex)
    return crypto.randomBytes(64).toString('hex');
}

// Função SHA1 para hash de senha
function sha1(input) {
    // ATENÇÃO DE SEGURANÇA: SHA1 é inseguro para hash de senhas.
    // Considere usar bcrypt, scrypt ou Argon2 para sistemas de produção.
    return crypto.createHash('sha1').update(input).digest('hex');
}

// Função para validar senha forte (back-end)
function isPasswordStrong(password) {
    // Regras comuns:
    // - Mínimo de 8 caracteres
    // - Pelo menos uma letra maiúscula
    // - Pelo menos uma letra minúscula
    // - Pelo menos um número
    // - Pelo menos um caractere especial (símbolos, pontuação, etc.)
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    // Verifica se tem pelo menos um caractere que NÃO é letra, número ou underline (para cobrir símbolos)
    // Ajuste esta regex se tiver requisitos específicos sobre quais caracteres especiais são permitidos
    if (!/^[a-zA-Z0-9_]+$/.test(password)) return true; // Se *não* consistir APENAS de alfanuméricos e underline, tem um especial
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false; // Alternativa: verificar por caracteres especiais específicos (menos flexível)


    return true; // Passou por todas as verificações
}


// --- Rotas ---

// Rota da Home Page (exemplo)
app.get('/', (req, res) => {
    res.render('index', { title: 'Home', user: req.session.user });
});

// Rota de Registro - Etapa 1 (GET)
app.get('/register', redirectIfLoggedIn, (req, res) => {
  // Passa mensagens de erro ou sucesso (se houver) do redirecionamento
  const errorMessage = req.session.errorMessage;
  const successMessage = req.session.successMessage;
  const formData = req.session.formDataStep1; // Dados pré-preenchidos da Step 1
  delete req.session.errorMessage; // Limpa a mensagem após usar
  delete req.session.successMessage;
  delete req.session.formDataStep1; // Limpa dados após usar

  res.render('register_step1', {
    title: 'Criar Conta - Etapa 1',
    user: req.session.user, // Pode ser null se não logado
    errorMessage: errorMessage,
    successMessage: successMessage,
    formData: formData // Passa dados para pré-preencher o formulário
  });
});

// Rota de Registro - Etapa 2 (GET)
app.get('/register/step2', redirectIfLoggedIn, (req, res) => {
     // Verifica se os dados da etapa 1 estão na sessão
    if (!req.session.registrationData) {
        req.session.errorMessage = 'Por favor, complete a Etapa 1 primeiro.';
        return res.redirect('/register'); // Redireciona de volta para a Etapa 1
    }

    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;
    const formData = req.session.formDataStep2; // Dados pré-preenchidos da Step 2
    delete req.session.errorMessage;
    delete req.session.successMessage;
    delete req.session.formDataStep2;

    res.render('register_step2', {
      title: 'Criar Conta - Etapa 2',
      user: req.session.user, // Pode ser null
      errorMessage: errorMessage,
      successMessage: successMessage,
      formData: formData // Passa dados para pré-preencher o formulário da Etapa 2
    });
});


// Rota de Registro (POST para processar ambas as etapas)
app.post('/register', redirectIfLoggedIn, async (req, res) => {
    const { step, name, email, password, confirm_password, country } = req.body;

    let connection;
    try {
        connection = await db.getConnection();

        if (step === '1') {
            // --- Processamento da Etapa 1 ---
            req.session.formDataStep1 = { name, email }; // Armazena dados para pré-preencher em caso de erro

            // Validação da Etapa 1
            if (!name || !email) {
                req.session.errorMessage = 'Por favor, preencha todos os campos.';
                return res.redirect('/register');
            }

            // Validação de formato de email (básica)
            if (!/\S+@\S+\.\S+/.test(email)) {
                 req.session.errorMessage = 'Por favor, insira um email válido.';
                 return res.redirect('/register');
            }

            // Verifica se o nome de conta OU email já existem
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

            // Se tudo OK, armazena dados na sessão e redireciona para Etapa 2
            req.session.registrationData = { name, email };
            delete req.session.formDataStep1; // Limpa dados de erro da etapa 1 após sucesso
            return res.redirect('/register/step2');

        } else if (step === '2') {
            // --- Processamento da Etapa 2 ---
            const registrationData = req.session.registrationData;

            // Verifica se os dados da etapa 1 existem na sessão
            if (!registrationData) {
                req.session.errorMessage = 'Sessão expirada ou Etapa 1 incompleta. Por favor, comece novamente.';
                return res.redirect('/register');
            }

            req.session.formDataStep2 = { country }; // Armazena dados da Etapa 2 para pré-preencher em caso de erro (senha não é armazenada)


            // Validação da Etapa 2
            if (!password || !confirm_password || !country) {
                req.session.errorMessage = 'Por favor, preencha todos os campos.';
                return res.redirect('/register/step2');
            }

            // Verifica se as senhas coincidem
            if (password !== confirm_password) {
                req.session.errorMessage = 'As senhas não coincidem.';
                return res.redirect('/register/step2');
            }

            // Valida a força da senha
            if (!isPasswordStrong(password)) {
                req.session.errorMessage = 'A senha não atende aos requisitos de segurança (Mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial).';
                return res.redirect('/register/step2');
            }

            // Combina dados da sessão (Etapa 1) com dados do corpo (Etapa 2)
            const { name, email } = registrationData; // Dados da Etapa 1

            // Hash da senha usando SHA1 (ATENÇÃO: SHA1 é inseguro)
            const hashedPassword = sha1(password);
            const generatedKey = generateKey();
            const creationTimestamp = Math.floor(Date.now() / 1000); // Timestamp Unix

             // Valores padrão para outros campos obrigatórios (conforme schema do banco, ajustado)
             const defaultValues = {
                 change_pass: 0,
                 salt: '',
                 premdays: 0,
                 lastday: 0,
                 blocked: 0,
                 warnings: 0,
                 group_id: 1,
                 type: 1,
                 accept_news: 0,
                 event_points: 0,
                 language: 0,
                 vip_time: 0,
                 lang_id: 0,
                 shop_points: 0,
                 userInfoProcessed: 0
             };

            // Insere o novo usuário no banco de dados
            const [result] = await connection.execute(
                `INSERT INTO accounts (name, email, password, \`key\`, location, created,
                 change_pass, salt, premdays, lastday, blocked, warnings, group_id, type,
                 accept_news, event_points, language, vip_time, lang_id, shop_points, userInfoProcessed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, email, hashedPassword, generatedKey, country, creationTimestamp, // Usando 'country' para 'location'
                 defaultValues.change_pass, defaultValues.salt, defaultValues.premdays, defaultValues.lastday, defaultValues.blocked,
                 defaultValues.warnings, defaultValues.group_id, defaultValues.type, defaultValues.accept_news,
                 defaultValues.event_points, defaultValues.language, defaultValues.vip_time, defaultValues.lang_id,
                 defaultValues.shop_points, defaultValues.userInfoProcessed
                ]
            );

            console.log('Novo usuário registrado com ID:', result.insertId);

            // Limpa os dados de registro da sessão após sucesso
            delete req.session.registrationData;
            delete req.session.formDataStep2; // Limpa dados de erro da etapa 2 após sucesso

            req.session.successMessage = 'Conta criada com sucesso! Faça login para continuar.';
            res.redirect('/login'); // Redireciona para a página de login

        } else {
            // Caso o campo 'step' esteja faltando ou seja inválido
            req.session.errorMessage = 'Etapa de registro inválida.';
            res.redirect('/register'); // Redireciona para o início
        }

    } catch (error) {
        console.error('Erro durante o registro:', error);
        // Se houver um erro no banco (ex: duplicidade), mesmo na etapa 2,
        // é melhor redirecionar para a etapa 1 para validar nome/email novamente.
        // Ou, se o erro for *após* as validações de nome/email, redirecionar para step 2.
        // Simplificação: se o erro acontecer *após* a validação da etapa 1, redireciona para etapa 2.
        // Se o erro for na etapa 1 (duplicidade), já foi tratado acima.
        // Para outros erros no INSERT (conexão, etc.), redirecionamos para step 2 se já passamos da step 1.
         if (req.session.registrationData) { // Se já havia dados da etapa 1 na sessão, o erro foi na etapa 2 (ou final)
             req.session.errorMessage = 'Erro ao finalizar o registro. Tente novamente mais tarde.';
             res.redirect('/register/step2');
         } else { // Se não havia dados da etapa 1, o erro foi na submissão da etapa 1 (algo inesperado, duplicidade já tratada)
             req.session.errorMessage = 'Erro ao processar a Etapa 1. Tente novamente mais tarde.';
             res.redirect('/register');
         }

    } finally {
        if (connection) connection.release(); // Sempre libera a conexão
    }
});


// Rota de Login (GET para exibir formulário) - Mantida
app.get('/login', redirectIfLoggedIn, (req, res) => {
    // Passa mensagens de erro ou sucesso (se houver)
    const errorMessage = req.session.errorMessage;
    const successMessage = req.session.successMessage;
    delete req.session.errorMessage; // Limpa após usar
    delete req.session.successMessage;

  res.render('login', {
      title: 'Login',
      user: req.session.user, // Pode ser null
      errorMessage: errorMessage,
      successMessage: successMessage
  });
});

// Rota de Login (POST para processar formulário) - Mantida (apenas name do input foi alterado)
app.post('/login', redirectIfLoggedIn, async (req, res) => {
  // loginIdentifier pode ser nome de conta ou email
  const { loginIdentifier, password } = req.body;

  if (!loginIdentifier || !password) {
    req.session.errorMessage = 'Por favor, digite seu nome de conta/email e senha.';
    return res.redirect('/login');
  }

  // Hash da senha digitada para comparação (ATENÇÃO: SHA1 inseguro)
  const hashedPassword = sha1(password);

  let connection;
  try {
    connection = await db.getConnection();

    // Busca o usuário pelo nome DE CONTA OU email
    // Usamos OR na cláusula WHERE
    const [users] = await connection.execute(
      'SELECT id, name, password FROM accounts WHERE name = ? OR email = ?',
      [loginIdentifier, loginIdentifier] // Passamos o mesmo valor para ambos os checks
    );

    // Verifica se o usuário foi encontrado e se a senha está correta
    if (users.length === 1 && users[0].password === hashedPassword) {
      // Usuário autenticado com sucesso
      const user = users[0];
      // Cria a sessão do usuário
      req.session.user = {
        id: user.id,
        name: user.name,
        // Não armazene dados sensíveis como senha ou email na sessão a menos que estritamente necessário
        // email: user.email // O email já está no objeto user se recuperado
      };
      console.log('Usuário logado:', user.name);
      req.session.successMessage = `Bem-vindo de volta, ${user.name}!`; // Mensagem de boas-vindas
      res.redirect('/dashboard'); // Redireciona para o dashboard

    } else {
      // Credenciais inválidas
      req.session.errorMessage = 'Nome de conta/email ou senha incorretos.';
      res.redirect('/login');
    }

  } catch (error) {
    console.error('Erro durante o login:', error);
    req.session.errorMessage = 'Erro ao tentar fazer login. Tente novamente mais tarde.';
    res.redirect('/login');
  } finally {
    if (connection) connection.release(); // Sempre libera a conexão
  }
});

// Rota do Dashboard (protegida por requireLogin) - Mantida
app.get('/dashboard', requireLogin, (req, res) => {
  // req.session.user contém as informações do usuário logado
    const successMessage = req.session.successMessage; // Pega a mensagem de boas-vindas
    delete req.session.successMessage;

  res.render('dashboard', {
    title: 'Dashboard',
    user: req.session.user, // Passa os dados do usuário para a view
    successMessage: successMessage
  });
});

// Rota de Logout - Mantida
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir a sessão:', err);
    }
    console.log('Usuário deslogado.');
    // Opcional: adicionar mensagem de sucesso após logout
    // req.session.successMessage = 'Você foi desconectado com sucesso.';
    res.redirect('/login'); // Redireciona para o login após logout
  });
});


// Exemplo de outras rotas, se existirem...
// app.get('/ranking', (req, res) => { ... });
// app.get('/shop', (req, res) => { ... });


// Rota padrão caso nenhuma rota seja encontrada (404) - Mantida
app.use((req, res) => {
    res.status(404).send('Página não encontrada'); // Ou renderizar uma view 404
});


// Iniciar o servidor - Mantido
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
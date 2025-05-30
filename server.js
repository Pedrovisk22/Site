const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura o Express para usar EJS como motor de template
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // Define EJS como o motor de visualização

// Servir arquivos estáticos da pasta 'public'
// É uma boa prática ter assets (css, js, images) em uma pasta 'public'
// Seus assets (css, js, images) estão na pasta public, então:
app.use(express.static(path.join(__dirname, 'public')));


// Rota principal - AGORA RENDERIZA um arquivo EJS
app.get('/', (req, res) => {
    // Usar res.render() para processar o arquivo EJS e incluir os partials
    res.render('index', { /* Adicione dados aqui se precisar passar para o template */ });
});

// Rota para a página de Ranking
app.get('/ranking', (req, res) => {
    res.render('ranking', { /* dados */ });
});

// Rota para a página da Loja
app.get('/shop', (req, res) => {
    res.render('shop', { /* dados */ });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse em: http://localhost:${PORT}`);
});
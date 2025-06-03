// db.js
const mysql = require('mysql2/promise'); // Usar a versão com Promises

const dbConfig = {
  host: '144.91.95.247',
  user: 'helton',
  password: 'coelhovoador',
  database: 'pokemonster',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};


let pool;

async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Pool de conexões MySQL criado e conectado ao banco de dados pokecamp.');

    // Teste inicial da conexão (opcional)
    const connection = await pool.getConnection();
    console.log('Conexão inicial com o banco de dados bem-sucedida.');
    connection.release(); // Libera a conexão de volta para o pool

  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    // Em uma aplicação real, você pode querer sair do processo ou tentar reconectar
    // process.exit(1);
  }
}

// Inicializa o pool quando o módulo é carregado
initializeDatabase();

// Função para obter uma conexão do pool
async function getConnection() {
  if (!pool) {
    throw new Error('O pool de conexões não foi inicializado. Verifique os erros de conexão.');
  }
  return pool.getConnection();
}

// Exporta a função para obter conexões
module.exports = {
  getConnection,
  // Opcional: exportar o pool diretamente se necessário
  pool
};
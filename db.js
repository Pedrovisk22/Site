
const mysql = require('mysql2');

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

const pool = mysql.createPool(dbConfig);

const promisePool = pool.promise();

pool.on('connection', (connection) => {
  console.log('Nova conexão obtida do pool.');
});

pool.on('error', (err) => {
  console.error('Erro no pool de conexões:', err);
});

promisePool.getConnection()
  .then(connection => {
    console.log('Conexão inicial com o banco de dados bem-sucedida.');
    connection.release();
  })
  .catch(err => {
    console.error('Erro ao obter conexão inicial do banco de dados:', err);
    process.exit(1);
  });


module.exports = {
    db: pool,
    promiseDb: promisePool
};
const connection = {
    host: '127.0.0.1',
    port: 3306,
    database: 'volcanoes',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
}

module.exports = {
    client: 'mysql2',
    connection: connection
};
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mariadb = require('mariadb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mariadb.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.then(conn => {
  console.log('Conectado a la base de datos MariaDB');
  // Aquí puedes realizar consultas usando `conn`
}).catch(err => {
  console.error('Error conectando a la base de datos:', err);
});

// Ruta de ejemplo
app.get('/', (req, res) => {
  res.send('¡Bienvenido a DineEase!');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

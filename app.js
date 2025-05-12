// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
// Otras rutas

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/users', userRoutes);
// Otras rutas

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

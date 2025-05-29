// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const restauranteRoutes = require('./routes/restauranteRoutes');
const rolRoutes = require('./routes/rolRoutes');
const permisoRoutes = require('./routes/permisoRoutes');
// Otras rutas

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/restaurantes', restauranteRoutes); 
app.use('/api/roles', rolRoutes);
app.use('/api/permisos', permisoRoutes);

// Otras rutas

// Middleware de manejo de errores global (debe ir al final)
app.use((err, req, res, next) => {
  console.error("ERROR GLOBAL:", err.status, err.message, err.stack.substring(0, 200));
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Error Interno del Servidor',
      // En desarrollo, podrías añadir: stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

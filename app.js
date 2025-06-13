// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const restauranteRoutes = require('./routes/restauranteRoutes');
const rolRoutes = require('./routes/rolRoutes');
const permisoRoutes = require('./routes/permisoRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes'); // Import inventarioRoutes
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path'); // Necesitarás 'path'
const fs = require('fs'); // Necesitarás 'fs' para leer archivos (o una librería como js-yaml)
const YAML = require('js-yaml'); // Instala: npm install js-yaml
// Otras rutas

const app = express();
const port = process.env.PORT || 3000;
// Opciones de Swagger JSDoc
// Función para cargar todos los schemas de un directorio
function loadSchemas(schemasPath) {
  const schemas = {};
  fs.readdirSync(schemasPath).forEach(file => {
    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      const schemaName = path.basename(file, path.extname(file)).replace('Schema', ''); // ej: rolSchema.yaml -> Rol
      const schemaContent = YAML.load(fs.readFileSync(path.join(schemasPath, file), 'utf8'));
      schemas[schemaName.charAt(0).toUpperCase() + schemaName.slice(1)] = schemaContent; // Capitaliza: rol -> Rol
    }
  });
  return schemas;
}

const schemasPath = path.join(__dirname, 'openapi', 'schemas'); // Ajusta la ruta
const loadedSchemas = loadSchemas(schemasPath);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de DineEase',
      version: '1.0.0',
      description: 'Documentación de la API para el sistema de gestión de restaurantes DineEase.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: loadedSchemas, 
    },
    
  },
  apis: [
    //'./routes/*.js'
    './routes/authRoutes.js',
    './routes/userRoutes.js',
    './routes/restauranteRoutes.js',
    './routes/rolRoutes.js',
    './routes/permisoRoutes.js',
    './routes/inventarioRoutes.js', // Add inventarioRoutes to Swagger
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);


app.use(cors());
app.use(bodyParser.json());

// Ruta para servir la UI de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/restaurantes', restauranteRoutes); 
app.use('/api/roles', rolRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/inventario', inventarioRoutes); // Use inventarioRoutes

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

// models/index.js
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize'); // Importa DataTypes también
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mariadb',
  port: process.env.DB_PORT || 3306, // Usa variable de entorno para el puerto o default
  logging: console.log, // O false para producción
  // dialectOptions: {
  //   timezone: 'local',
  // },
});

const db = {}; // Objeto para mantener todos los modelos

// Cargar dinámicamente todos los archivos de modelo de la carpeta actual
const basename = path.basename(__filename);
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && // No archivos ocultos
           (file !== basename) &&      // No este mismo archivo (index.js)
           (file.slice(-3) === '.js'); // Solo archivos .js
  })
  .forEach(file => {
    // Cada archivo de modelo debe exportar una función que toma (sequelize, DataTypes)
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model; // Añade el modelo al objeto db usando su nombre
                           // (el nombre que le diste en sequelize.define('NombreDelModelo', ...))
  });

// Ejecutar las asociaciones de los modelos si existen
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // Pasa el objeto db completo para las asociaciones
  }
});

// Probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MariaDB establecida exitosamente.');

    // Opcional: Sincronizar modelos (útil en desarrollo, usa migraciones en producción)
    // await sequelize.sync({ alter: true }); // alter: true intenta modificar tablas existentes
    // await sequelize.sync({ force: true }); // force: true BORRA y recrea tablas (¡CUIDADO!)
    // console.log("Todos los modelos fueron sincronizados correctamente.");

  } catch (error) {
    console.error('No se pudo conectar a MariaDB o sincronizar modelos:', error);
  }
}

testConnection();

// Adjuntar la instancia de sequelize y la clase Sequelize al objeto db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; // ¡Exporta el objeto db que contiene los modelos y sequelize!
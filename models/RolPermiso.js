// models/RolPermiso.js - Crear solo si tiene campos adicionales
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RolPermiso = sequelize.define('RolPermiso', {
    idRolPermiso: { // Opcional, si tienes PK en la tabla intermedia
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idRolPermiso'
    },
    idRol: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Rol', // Nombre del *modelo*
        key: 'idRol'
      },
      primaryKey: true // Si es parte de la clave primaria compuesta
    },
    idPermiso: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Permiso', // Nombre del *modelo*
        key: 'idPermiso'
      },
      primaryKey: true // Si es parte de la clave primaria compuesta
    }
    // Añadir otros campos si existen en tu tabla rol_permiso
  }, {
    tableName: 'rol_permiso', // Nombre exacto de la tabla
    timestamps: false
  });

  return RolPermiso;
};
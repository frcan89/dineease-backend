// models/RolPermiso.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RolPermiso = sequelize.define('RolPermiso', {
    id_rol_permiso: { // Coincide con tu DDL
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Rol', // Nombre del *modelo*
        key: 'id_rol',
      },
    },
    id_permiso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Permiso', // Nombre del *modelo*
        key: 'id_permiso',
      },
    }
    // fecha_creacion y fecha_actualizacion son manejadas por Sequelize
  }, {
    tableName: 'rol_permiso',
    timestamps: true, // Tiene fecha_creacion y fecha_actualizacion
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    // No tiene eliminación lógica propia, se elimina la relación directamente.
    // paranoid: false, // Por lo tanto, no es paranoid
  });

  // No necesita 'associate' si solo es una tabla de unión simple y las
  // asociaciones ya están definidas en Rol y Permiso usando `through: models.RolPermiso`.
  // Si tuviera relaciones propias, se definirían aquí.

  return RolPermiso;
};
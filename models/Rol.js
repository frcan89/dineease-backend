// models/Rol.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rol = sequelize.define('Rol', {
    id_rol: { // Coincide con tu DDL
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      // field: 'id_rol' // No es necesario si el nombre del atributo y la columna coinciden
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    eliminado: {
      type: DataTypes.BOOLEAN, // TINYINT(1) se mapea bien a BOOLEAN
      allowNull: false,
      defaultValue: false,
    },
    fecha_eliminacion: {
      type: DataTypes.DATE,
      allowNull: true,
    }
    // fecha_creacion y fecha_actualizacion son manejadas por Sequelize
  }, {
    tableName: 'rol',
    timestamps: true, // Sequelize manejará fecha_creacion y fecha_actualizacion
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true, // Para eliminación lógica, usará 'fecha_eliminacion'
    deletedAt: 'fecha_eliminacion', // Especifica la columna para paranoid
  });

  Rol.associate = (models) => {
    Rol.hasMany(models.Usuario, { foreignKey: 'id_rol' });
    Rol.belongsToMany(models.Permiso, {
      through: models.RolPermiso, // Usar el modelo RolPermiso
      foreignKey: 'id_rol',
      otherKey: 'id_permiso',
      // timestamps: false, // La tabla intermedia RolPermiso tiene sus propios timestamps
    });
  };

  // Hook para actualizar el campo 'eliminado' cuando se usa paranoid
  Rol.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  Rol.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });


  return Rol;
};
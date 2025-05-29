// models/Permiso.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permiso = sequelize.define('Permiso', {
    id_permiso: { // Coincide con tu DDL
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fecha_eliminacion: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'permiso',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true,
    deletedAt: 'fecha_eliminacion',
  });

  Permiso.associate = (models) => {
    Permiso.belongsToMany(models.Rol, {
      through: models.RolPermiso, // Usar el modelo RolPermiso
      foreignKey: 'id_permiso',
      otherKey: 'id_rol',
    });
  };

  // Hook para actualizar el campo 'eliminado'
  Permiso.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  Permiso.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return Permiso;
};
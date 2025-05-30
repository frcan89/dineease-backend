// models/PerfilUsuario.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PerfilUsuario = sequelize.define('PerfilUsuario', {
    id_perfil_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Para asegurar la relación 1-a-1
      references: {
        model: 'Usuario', // Nombre del modelo
        key: 'id_usuario',
      },
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    documento_identidad: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    notas: {
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
    tableName: 'perfil_usuario',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true,
    deletedAt: 'fecha_eliminacion',
  });

  PerfilUsuario.associate = (models) => {
    PerfilUsuario.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
  };

  // Hooks para 'eliminado'
  PerfilUsuario.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  PerfilUsuario.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return PerfilUsuario;
};
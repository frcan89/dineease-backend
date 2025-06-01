// models/Usuario.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    password_hash: { // Coincide con DDL
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Rol', key: 'id_rol' }, // Asumiendo que 'Rol' es el nombre del modelo
    },
    estado: { // Este campo ya lo usas para activo/inactivo
      type: DataTypes.BOOLEAN, // tinyint(1)
      allowNull: false,
      defaultValue: true, // 1 es true
    },
    ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id_restaurante: {
      type: DataTypes.INTEGER,
      allowNull: true, // Como en tu DDL
      references: { model: 'Restaurante', key: 'id_restaurante' }, // Ajusta key si es id_restaurante
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
    // fecha_creacion, fecha_actualizacion manejadas por Sequelize
  }, {
    tableName: 'usuario',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true, // Habilita eliminación lógica
    deletedAt: 'fecha_eliminacion', // Columna para paranoid

    hooks: {
      beforeSave: async (usuario, options) => {
        if (usuario.changed('password_hash')) { // Si se intenta guardar 'password_hash'
          const salt = await bcrypt.genSalt(10);
          usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
        }
      }
    }
  });

  Usuario.prototype.validarPassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Rol, { foreignKey: 'id_rol' });
    Usuario.belongsTo(models.Restaurante, { foreignKey: 'id_restaurante' }); // Ajusta foreignKey si es id_restaurante
    Usuario.hasOne(models.PerfilUsuario, { foreignKey: 'id_usuario', as: 'perfil' }); // Asumiendo modelo PerfilUsuario
    Usuario.hasMany(models.Pedido, { foreignKey: 'id_usuario_empleado', as: 'pedidosCreados' }); // Ejemplo
    // ... otras asociaciones ...
  };

  // Hooks para sincronizar 'eliminado' con 'fecha_eliminacion' (paranoid)
  Usuario.addHook('afterDestroy', async (instance, options) => {
    // Cuando paranoid:true destruye, setea deletedAt (fecha_eliminacion)
    // Aquí actualizamos el campo 'eliminado' booleano
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });

  Usuario.addHook('afterRestore', async (instance, options) => {
    // Cuando se restaura, deletedAt (fecha_eliminacion) se pone a null
    // Aquí actualizamos el campo 'eliminado' booleano
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return Usuario;
};
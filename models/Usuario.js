const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt'); // Necesitarás instalar bcrypt: npm install bcrypt

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    idUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idUsuario'
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
        isEmail: true, // Validación básica de email
      }
    },
    contraseña: { // Nombre del campo en el modelo
      type: DataTypes.STRING(255), // BCrypt genera hashes largos
      allowNull: false,
      field: 'contraseña' // Nombre exacto de la columna en BD
    },
    estado: {
      type: DataTypes.BOOLEAN, // O ENUM si usaste eso en la BD
      allowNull: false,
      defaultValue: true, // Por defecto, activo
    },
    ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ultimo_acceso'
    },
    idRol: {
      type: DataTypes.INTEGER,
      allowNull: false, // Asumiendo que todo usuario DEBE tener un rol
      references: {
        model: 'Rol', // Nombre del *modelo* Rol
        key: 'idRol'
      },
      field: 'idRol'
    },
    idRestaurante: {
      type: DataTypes.INTEGER,
      allowNull: false, // Asumiendo que todo usuario pertenece a un restaurante
      references: {
        model: 'Restaurante', // Nombre del *modelo* Restaurante
        key: 'idRestaurante'
      },
      field: 'idRestaurante'
    }
  }, {
    tableName: 'usuario',
    timestamps: true, // Asumiendo createdAt/updatedAt
    hooks: {
      // Hook para hashear la contraseña ANTES de crear o actualizar el usuario
      beforeSave: async (usuario, options) => {
        if (usuario.changed('contraseña')) { // Solo hashear si la contraseña cambió
          const salt = await bcrypt.genSalt(10); // 10 rondas es un buen balance
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
        }
      }
      // Podrías usar beforeCreate y beforeUpdate por separado también
    }
  });

  // Método de instancia para validar la contraseña
  Usuario.prototype.validarPassword = async function(password) {
    return await bcrypt.compare(password, this.contraseña);
  };

  Usuario.associate = (models) => {
    // Un Usuario pertenece a un Rol y a un Restaurante
    Usuario.belongsTo(models.Rol, { foreignKey: 'idRol' });
    Usuario.belongsTo(models.Restaurante, { foreignKey: 'idRestaurante' });
    // Un Usuario tiene un DataUsuario
    Usuario.hasOne(models.DataUsuario, { foreignKey: 'idUsuario' });
    // Un Usuario puede crear muchos Pedidos
    Usuario.hasMany(models.Pedido, { foreignKey: 'idUsuario' }); // Asumiendo que idUsuario en Pedido es el creador
    // Un Usuario puede ser responsable de muchos Movimientos de Inventario
    Usuario.hasMany(models.MovimientoInventario, { foreignKey: 'idUsuario' }); // Asumiendo idUsuario aquí es el responsable
  };

  return Usuario;
};
// models/Pedido.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pedido = sequelize.define('Pedido', {
    id_pedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_mesa: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_usuario_empleado: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Pendiente',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    },
    id_restaurante: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eliminado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha_eliminacion: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'pedido',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true,
    deletedAt: 'fecha_eliminacion',
  });

  Pedido.associate = (models) => {
    Pedido.belongsTo(models.Mesa, { foreignKey: 'id_mesa' });
    Pedido.belongsTo(models.Usuario, { foreignKey: 'id_usuario_empleado', as: 'empleado' });
    Pedido.belongsTo(models.Usuario, { foreignKey: 'id_cliente', as: 'cliente' });
    Pedido.belongsTo(models.Restaurante, { foreignKey: 'id_restaurante' });

    // La asociación no cambia aquí, Sequelize resolverá el mapeo en ItemPedido
    Pedido.hasMany(models.ItemPedido, {
      foreignKey: 'id_pedido',
      as: 'items',
    });
    Pedido.hasOne(models.Pago, { foreignKey: 'id_pedido' });
  };

  // Hooks para 'eliminado'
  Pedido.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  Pedido.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return Pedido;
};
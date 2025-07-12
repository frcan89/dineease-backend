// models/ItemPedido.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemPedido = sequelize.define('ItemPedido', {
    id_item_pedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Pedido', key: 'id_pedido' },
    },
    // *** CORRECCIÓN FINAL ***
    // Ahora el nombre del atributo ('id_menu') coincide con el de la columna en la BD.
    // No se necesita la opción 'field'.
    id_menu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Menu', key: 'id_menu' },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    precio_unitario_momento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    notas_item: {
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
    tableName: 'item_pedido',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true,
    deletedAt: 'fecha_eliminacion',
  });

  ItemPedido.associate = (models) => {
    ItemPedido.belongsTo(models.Pedido, { foreignKey: 'id_pedido' });
    // *** ASOCIACIÓN SIMPLIFICADA ***
    // La asociación ahora es directa y usa la clave foránea por defecto (o explícita).
    ItemPedido.belongsTo(models.Menu, { foreignKey: 'id_menu' });
  };

  // Los hooks no necesitan cambio
  ItemPedido.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  ItemPedido.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return ItemPedido;
};
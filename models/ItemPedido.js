const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemPedido = sequelize.define('ItemPedido', {
    idItemPedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idItemPedido'
    },
    idPedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Pedido', key: 'idPedido' },
      field: 'idPedido'
    },
    idItemMenu: { // Referencia al item específico del menú que se pidió
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'ItemMenu', key: 'idItemMenu' },
      field: 'idItemMenu'
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    // Podrías guardar el precio unitario aquí al momento de añadirlo
    // por si cambia en el ItemMenu después
    // precio_unitario_momento: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    // estado_item: { type: DataTypes.ENUM('PENDIENTE', 'EN_COCINA', 'LISTO', 'ENTREGADO', 'CANCELADO'), defaultValue: 'PENDIENTE'} // Opcional
  }, {
    tableName: 'item_pedido',
    timestamps: false // Opcional, si necesitas saber cuándo se añadió cada item
  });

  ItemPedido.associate = (models) => {
    ItemPedido.belongsTo(models.Pedido, { foreignKey: 'idPedido' });
    ItemPedido.belongsTo(models.ItemMenu, { foreignKey: 'idItemMenu' });
  };

  return ItemPedido;
};
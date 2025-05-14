const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemMenu = sequelize.define('ItemMenu', {
    idItemMenu: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idItemMenu'
    },
    idMenu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Menu', key: 'idMenu' },
      field: 'idMenu'
    },
    idReceta: { // El item se basa en una receta
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Receta', key: 'idReceta' },
      field: 'idReceta'
    },
    // El precio de venta específico de este item en este menú
    // precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // <-- Lo moví de Receta
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  }, {
    tableName: 'item_menu',
    timestamps: true, // O false si no necesitas saber cuándo se añadió/modificó
  });

  ItemMenu.associate = (models) => {
    ItemMenu.belongsTo(models.Menu, { foreignKey: 'idMenu' });
    ItemMenu.belongsTo(models.Receta, { foreignKey: 'idReceta' });
    // Un ItemMenu puede estar en muchos Items de Pedido
    ItemMenu.hasMany(models.ItemPedido, { foreignKey: 'idItemMenu' });
  };

  return ItemMenu;
};
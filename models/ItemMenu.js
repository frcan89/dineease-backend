// models/ItemMenu.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemMenu = sequelize.define('ItemMenu', {
    id_item_menu: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_menu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Menu', key: 'id_menu' },
    },
    id_receta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Receta', key: 'id_receta' },
    },
    precio_item: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Precio del item individual dentro del menu',
    },
    disponible: {
      type: DataTypes.BOOLEAN, // TINYINT(1)
      allowNull: false,
      defaultValue: true,
      comment: '1: Disponible, 0: No disponible',
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
    tableName: 'item_menu',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true,
    deletedAt: 'fecha_eliminacion',
  });

  ItemMenu.associate = (models) => {
    ItemMenu.belongsTo(models.Menu, { foreignKey: 'id_menu' });
    ItemMenu.belongsTo(models.Receta, { foreignKey: 'id_receta' });
  };

  ItemMenu.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  ItemMenu.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return ItemMenu;
};
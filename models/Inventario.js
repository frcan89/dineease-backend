const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventario = sequelize.define('Inventario', {
    idInventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idInventario'
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Cada producto tiene una sola entrada de inventario
      references: {
        model: 'Producto',
        key: 'idProducto'
      },
      field: 'idProducto'
    },
    cantidad: {
      type: DataTypes.INTEGER, // O DECIMAL si aplica
      allowNull: false,
      defaultValue: 0,
    },
    ultima_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'ultima_actualizacion'
    }
  }, {
    tableName: 'inventario',
    timestamps: false // Ya tenemos ultima_actualizacion
  });

  Inventario.associate = (models) => {
    // El inventario pertenece a un Producto
    Inventario.belongsTo(models.Producto, { foreignKey: 'idProducto' });
  };

  return Inventario;
};
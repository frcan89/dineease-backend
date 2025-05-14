const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IngredienteReceta = sequelize.define('IngredienteReceta', {
    idIngredienteReceta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idIngredienteReceta'
    },
    idReceta: {
      type: DataTypes.INTEGER,
      references: { model: 'Receta', key: 'idReceta' },
      allowNull: false,
      field: 'idReceta'
    },
    idProducto: {
      type: DataTypes.INTEGER,
      references: { model: 'Producto', key: 'idProducto' },
      allowNull: false,
      field: 'idProducto'
    },
    cantidad: {
      type: DataTypes.INTEGER, // O DECIMAL
      allowNull: false,
    }
    // unidad_medida_receta: { type: DataTypes.STRING(50), allowNull: true }, // Ejemplo campo extra
  }, {
    tableName: 'ingrediente_receta',
    timestamps: false
  });

   IngredienteReceta.associate = (models) => {
        IngredienteReceta.belongsTo(models.Receta, { foreignKey: 'idReceta' });
        IngredienteReceta.belongsTo(models.Producto, { foreignKey: 'idProducto' });
  };

  return IngredienteReceta;
};
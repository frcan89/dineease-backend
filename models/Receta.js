const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Receta = sequelize.define('Receta', {
    idReceta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idReceta'
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tiempo_preparacion: { // En minutos
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'tiempo_preparacion'
    },
    instrucciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    porciones: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    precio: { // Precio de VENTA si la receta se vende directamente (o costo?)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // El precio puede estar en ItemMenu
    },
    idRestaurante: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Restaurante', key: 'idRestaurante' },
        field: 'idRestaurante'
      }
  }, {
    tableName: 'receta',
    timestamps: true,
  });

  Receta.associate = (models) => {
    Receta.belongsTo(models.Restaurante, { foreignKey: 'idRestaurante' });
    // Una receta tiene muchos Productos (ingredientes) a través de IngredienteReceta
    Receta.belongsToMany(models.Producto, {
        through: 'IngredienteReceta',
        foreignKey: 'idReceta',
        otherKey: 'idProducto',
        timestamps: false
     });
     // Una receta puede estar en muchos Items de Menu
     Receta.hasMany(models.ItemMenu, { foreignKey: 'idReceta'});
  };

  return Receta;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Producto = sequelize.define('Producto', {
    idProducto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idProducto'
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unidad_medida: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'unidad_medida'
    },
    precio_compra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // ¿Puede ser nulo?
      field: 'precio_compra'
    },
    stock_minimo: {
      type: DataTypes.INTEGER, // O DECIMAL si manejas fracciones
      allowNull: true,
      field: 'stock_minimo'
    },
    idUsuario: { // Usuario que creó/registró el producto
      type: DataTypes.INTEGER,
      allowNull: true, // ¿Es obligatorio saber quién lo creó?
      references: {
        model: 'Usuario',
        key: 'idUsuario'
      },
      field: 'idUsuario'
    },
    idRestaurante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Restaurante',
        key: 'idRestaurante'
      },
      field: 'idRestaurante'
    }
  }, {
    tableName: 'producto',
    timestamps: true, // Asumiendo createdAt/updatedAt
  });

  Producto.associate = (models) => {
    // Un Producto pertenece a un Restaurante y (opcionalmente) a un Usuario creador
    Producto.belongsTo(models.Restaurante, { foreignKey: 'idRestaurante' });
    Producto.belongsTo(models.Usuario, { foreignKey: 'idUsuario' }); // Alias podría ser 'Creador'

    // Un Producto tiene una entrada en Inventario
    Producto.hasOne(models.Inventario, { foreignKey: 'idProducto' });
    // Un Producto puede tener muchos Movimientos de Inventario
    Producto.hasMany(models.MovimientoInventario, { foreignKey: 'idProducto' });
    // Un Producto pertenece a muchas Recetas a través de IngredienteReceta
    Producto.belongsToMany(models.Receta, {
        through: 'IngredienteReceta', // Modelo o nombre de tabla intermedia
        foreignKey: 'idProducto',
        otherKey: 'idReceta',
        timestamps: false
     });
  };

  return Producto;
};
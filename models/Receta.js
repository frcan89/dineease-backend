// models/Receta.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Receta = sequelize.define('Receta', {
    id_receta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    },
    instrucciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    porciones: {
      type: DataTypes.INTEGER,
      allowNull: true, // DDL dice DEFAULT 1, pero allowNull true permite omitirlo
      defaultValue: 1,
    },
    precio_costo: { // Costo de preparación de la receta
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    id_restaurante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Restaurante', // Nombre del modelo Restaurante
        key: 'idRestaurante', // PK en tu modelo Restaurante
      },
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
    tableName: 'receta',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true,
    deletedAt: 'fecha_eliminacion',
  });

  Receta.associate = (models) => {
    Receta.belongsTo(models.Restaurante, { foreignKey: 'id_restaurante' });

    // Relación muchos-a-muchos con Producto a través de IngredienteReceta
    Receta.belongsToMany(models.Producto, {
      through: models.IngredienteReceta, // El modelo de la tabla intermedia
      foreignKey: 'id_receta',          // Clave en IngredienteReceta que apunta a Receta
      otherKey: 'id_producto',        // Clave en IngredienteReceta que apunta a Producto
      as: 'ingredientes',             // Alias para acceder a los productos como ingredientes
    });

    // Una Receta puede estar en muchos Items de Menu
    Receta.hasMany(models.ItemMenu, { foreignKey: 'id_receta' });
  };

  Receta.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  Receta.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return Receta;
};
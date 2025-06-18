// models/Producto.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Producto = sequelize.define('Producto', {
    id_producto: {
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
    unidad_medida: {
      type: DataTypes.STRING(50),
      allowNull: true, // DDL dice DEFAULT NULL
    },
    precio_compra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      allowNull: true, // DDL dice DEFAULT 0, pero puede ser null si no se especifica
      defaultValue: 0,
    },
    id_usuario_registro: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Usuario', // Nombre del modelo Usuario
        key: 'id_usuario',
      },
    },
    id_restaurante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Restaurante', // Nombre del modelo Restaurante
        key: 'id_restaurante', // Asegúrate que coincida con la PK en tu modelo Restaurante
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
    // fecha_creacion y fecha_actualizacion son manejadas por Sequelize
  }, {
    tableName: 'producto',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true, // Habilita eliminación lógica
    deletedAt: 'fecha_eliminacion', // Columna para paranoid
  });

  Producto.associate = (models) => {
    Producto.belongsTo(models.Restaurante, { foreignKey: 'id_restaurante' });
    Producto.belongsTo(models.Usuario, { foreignKey: 'id_usuario_registro', as: 'usuarioRegistro' });

    Producto.hasOne(models.Inventario, { foreignKey: 'id_producto' });
    Producto.hasMany(models.MovimientoInventario, { foreignKey: 'id_producto' });
    Producto.belongsToMany(models.Receta, {
        through: models.IngredienteReceta, // Usar el modelo IngredienteReceta
        foreignKey: 'id_producto',
        otherKey: 'id_receta', // Asegúrate que id_receta es la FK en IngredienteReceta para Receta
     });
  };

  // Hooks para sincronizar 'eliminado' con 'fecha_eliminacion' (paranoid)
  Producto.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  Producto.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return Producto;
};
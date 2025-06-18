// models/IngredienteReceta.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IngredienteReceta = sequelize.define('IngredienteReceta', {
    id_ingrediente_receta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_receta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Receta', key: 'id_receta' },
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Producto', key: 'id_producto' },
    },
    cantidad: { // Cantidad del producto necesaria para la receta
      type: DataTypes.DECIMAL(10, 2), // DDL es decimal
      allowNull: false,
    },
    unidad_medida_receta: { // Ej: gramos, ml, unidades.
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    // El DDL también tiene eliminado y fecha_eliminacion para esta tabla
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
    tableName: 'ingrediente_receta',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    // Si quieres eliminación lógica para los ingredientes específicos de una receta
    // (por ejemplo, si modificas una receta y quitas un ingrediente, en lugar de borrarlo
    // físicamente de ingrediente_receta, lo marcas como eliminado)
    paranoid: true,
    deletedAt: 'fecha_eliminacion',
  });

  // No necesita 'associate' explícita aquí si solo es tabla de unión con atributos
  // y las asociaciones belongsToMany en Receta y Producto usan `through: models.IngredienteReceta`.
  // Sequelize entiende las FKs `id_receta` e `id_producto` por convención o por `references`.

  // Hooks si 'ingrediente_receta' usa paranoid
  IngredienteReceta.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  IngredienteReceta.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return IngredienteReceta;
};
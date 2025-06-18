// models/Inventario.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventario = sequelize.define('Inventario', {
    id_inventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Como en tu DDL: UNIQUE KEY `uq_inventario_id_producto` (`id_producto`)
      references: {
        model: 'Producto', // Nombre del modelo Producto
        key: 'id_producto', // Clave primaria en la tabla Producto
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0 // La cantidad no debería ser negativa
      }
    },
    // fecha_creacion y fecha_actualizacion son manejadas por Sequelize
    // a través de las opciones de timestamps.
    // La columna `fecha_actualizacion` de tu DDL se actualiza automáticamente por la BD,
    // Sequelize también intentará actualizar su `updatedAt`.
    eliminado: {
      type: DataTypes.BOOLEAN, // TINYINT(1)
      allowNull: false,
      defaultValue: false,
    },
    fecha_eliminacion: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'inventario',
    timestamps: true, // Habilita createdAt y updatedAt de Sequelize
    createdAt: 'fecha_creacion', // Mapea createdAt a tu columna fecha_creacion
    updatedAt: 'fecha_actualizacion', // Mapea updatedAt a tu columna fecha_actualizacion
    paranoid: true, // Habilita la eliminación lógica
    deletedAt: 'fecha_eliminacion', // Especifica la columna para la eliminación lógica
  });

  Inventario.associate = (models) => {
    // Un registro de Inventario pertenece a un Producto
    Inventario.belongsTo(models.Producto, {
      foreignKey: 'id_producto',
      // onDelete: 'CASCADE' // Sequelize puede manejar esto si la BD no lo hace,
      // onUpdate: 'CASCADE' // pero tu FK ya lo tiene.
    });

    // Opcional: Si quieres rastrear movimientos específicos desde el inventario
    // Inventario.hasMany(models.MovimientoInventario, { foreignKey: 'id_inventario_origen' }); // Ejemplo
  };

  // Hooks para sincronizar el campo 'eliminado' con el estado paranoid de Sequelize
  Inventario.addHook('afterDestroy', async (instance, options) => {
    // Cuando paranoid:true destruye, setea deletedAt (fecha_eliminacion)
    // Aquí actualizamos el campo 'eliminado' booleano
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });

  Inventario.addHook('afterRestore', async (instance, options) => {
    // Cuando se restaura, deletedAt (fecha_eliminacion) se pone a null
    // Aquí actualizamos el campo 'eliminado' booleano
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return Inventario;
};
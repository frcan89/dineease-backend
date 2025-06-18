// models/MovimientoInventario.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MovimientoInventario = sequelize.define('MovimientoInventario', {
    id_movimiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Producto', key: 'id_producto' },
    },
    id_usuario_responsable: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser null si es un movimiento automático del sistema
      references: { model: 'Usuario', key: 'id_usuario' },
    },
    tipo_movimiento: {
      type: DataTypes.ENUM( // Ampliamos los tipos
        'ENTRADA_COMPRA', // Ingreso por compra a proveedor
        'ENTRADA_AJUSTE', // Ajuste positivo de inventario
        'ENTRADA_DEVOLUCION_CLIENTE', // Devolución de un cliente
        'SALIDA_VENTA',
        'SALIDA_CONSUMO_INTERNO', // Ej: ingredientes usados en preparación que no se descuentan automáticamente de receta
        'SALIDA_MERMA',
        'SALIDA_AJUSTE', // Ajuste negativo de inventario
        'SALIDA_DEVOLUCION_PROVEEDOR'
      ),
      allowNull: false,
    },
    cantidad_movida: { // Siempre positivo, el tipo_movimiento define si suma o resta
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1 // Un movimiento debe ser de al menos 1 unidad
      }
    },
    cantidad_anterior: { // Stock del producto ANTES de este movimiento
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cantidad_nueva: { // Stock del producto DESPUÉS de este movimiento
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    precio_compra_unitario_movimiento: { // Precio de compra unitario PARA ESTE MOVIMIENTO específico (si aplica)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Solo relevante para ENTRADA_COMPRA o similares
    },
    motivo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fecha_movimiento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // Opcional: Referencias a otros documentos
    // id_documento_referencia: { type: DataTypes.INTEGER, allowNull: true },
    // tipo_documento_referencia: { type: DataTypes.STRING(50), allowNull: true }, // 'FACTURA_COMPRA', 'NOTA_CREDITO', etc.
  }, {
    tableName: 'movimiento_inventario',
    timestamps: false, // Ya tenemos fecha_movimiento
  });

  MovimientoInventario.associate = (models) => {
    MovimientoInventario.belongsTo(models.Producto, { foreignKey: 'id_producto' });
    MovimientoInventario.belongsTo(models.Usuario, { foreignKey: 'id_usuario_responsable', as: 'usuarioResponsable' });
  };

  return MovimientoInventario;
};
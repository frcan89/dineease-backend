const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MovimientoInventario = sequelize.define('MovimientoInventario', {
    idMovimientoInventario: { // Si tienes PK
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idMovimientoInventario'
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Producto', key: 'idProducto' },
      field: 'idProducto'
    },
    cantidad: { // Cantidad que se movió (+ para entrada, - para salida)
      type: DataTypes.INTEGER, // O DECIMAL
      allowNull: false,
    },
    tipo_movimiento: { // 'ENTRADA', 'SALIDA', 'AJUSTE', 'VENTA' etc.
      type: DataTypes.ENUM('ENTRADA', 'SALIDA', 'AJUSTE', 'VENTA'), // Ajusta los valores
      allowNull: false,
      field: 'tipo_movimiento'
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    idUsuario: { // Usuario responsable
      type: DataTypes.INTEGER,
      allowNull: true, // ¿Siempre hay un responsable?
      references: { model: 'Usuario', key: 'idUsuario' },
      field: 'idUsuario'
    },
    motivo: { // Descripción breve (Compra a proveedor X, Ajuste por merma, Venta pedido Y)
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Podrías añadir referencia a Pedido si es una salida por venta
    // idPedido: { type: DataTypes.INTEGER, allowNull: true, references: ... }
  }, {
    tableName: 'movimiento_inventario', // Nombre exacto
    timestamps: false // Ya tenemos la columna fecha
  });

    MovimientoInventario.associate = (models) => {
        MovimientoInventario.belongsTo(models.Producto, { foreignKey: 'idProducto' });
        MovimientoInventario.belongsTo(models.Usuario, { foreignKey: 'idUsuario' });
        // MovimientoInventario.belongsTo(models.Pedido, { foreignKey: 'idPedido' }); // Si aplica
  };

  return MovimientoInventario;
};
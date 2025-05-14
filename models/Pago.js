const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pago = sequelize.define('Pago', {
    idPago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idPago'
    },
    idPedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // unique: true, // Un pedido usualmente tiene un solo pago final
      references: { model: 'Pedido', key: 'idPedido' },
      field: 'idPedido'
    },
    monto: { // Monto total pagado (puede incluir propina)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cambio: { // Cambio devuelto al cliente
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Puede ser 0 o nulo
      defaultValue: 0.00
    },
    metodo_pago: { // 'EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'APP_PAGO'
      type: DataTypes.STRING(50), // O ENUM
      allowNull: false,
      field: 'metodo_pago'
    },
    estado: { // 'PENDIENTE', 'COMPLETADO', 'FALLIDO', 'REEMBOLSADO'
      type: DataTypes.STRING(50), // O ENUM
      allowNull: false,
      defaultValue: 'COMPLETADO'
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_pago'
    }
  }, {
    tableName: 'pago',
    timestamps: false // Ya tenemos fecha_pago
  });

  Pago.associate = (models) => {
    Pago.belongsTo(models.Pedido, { foreignKey: 'idPedido' });
    // Un Pago tiene una Factura asociada
    Pago.hasOne(models.Factura, { foreignKey: 'idPago' });
  };

  return Pago;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Factura = sequelize.define('Factura', {
    idFactura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idFactura'
    },
    idPago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Un pago genera una factura
      references: { model: 'Pago', key: 'idPago' },
      field: 'idPago'
    },
    numero: { // Número de factura legal (puede tener prefijo, etc.)
      type: DataTypes.INTEGER, // O STRING si es alfanumérico
      allowNull: false, // O true si se genera después
      unique: true // Generalmente el número de factura es único
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_emision'
    },
    impuestos: { // Monto total de impuestos aplicados
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    }
    // subtotal y total podrían estar aquí también, o calcularse al consultar
    // Podrías añadir datos del cliente si es una factura nominativa
    // datos_cliente_json: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: 'factura',
    timestamps: false // Ya tenemos fecha_emision
  });

  Factura.associate = (models) => {
    Factura.belongsTo(models.Pago, { foreignKey: 'idPago' });
  };

  return Factura;
};
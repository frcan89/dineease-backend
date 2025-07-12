// models/Pago.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pago = sequelize.define('Pago', {
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Pedido', key: 'id_pedido' },
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cambio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    },
    metodo_pago: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Pendiente',
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    eliminado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fecha_eliminacion: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'pago',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true,
    deletedAt: 'fecha_eliminacion',
  });

  Pago.associate = (models) => {
    Pago.belongsTo(models.Pedido, { foreignKey: 'id_pedido' });
    Pago.hasOne(models.Factura, { foreignKey: 'id_pago' }); // Si tienes un modelo Factura
  };

  // ... (Hooks para 'eliminado' si son necesarios) ...

  return Pago;
};
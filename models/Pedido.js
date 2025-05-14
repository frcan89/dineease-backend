const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pedido = sequelize.define('Pedido', {
    idPedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idPedido'
    },
    idMesa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Mesa', key: 'idMesa' },
      field: 'idMesa'
    },
    idUsuario: { // Usuario que tomó/creó el pedido (mesero)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Usuario', key: 'idUsuario' },
      field: 'idUsuario'
    },
    idCliente: { // Podría ser nulo si no registras clientes, o referenciar a Usuario si cliente=Usuario
      type: DataTypes.INTEGER,
      allowNull: true, // ¿Es obligatorio?
      // references: { model: 'Usuario', key: 'idUsuario' }, // Si cliente es un Usuario
      field: 'idCliente'
    },
    estado: { // 'ABIERTO', 'EN_PREPARACION', 'LISTO_PARA_SERVIR', 'SERVIDO', 'CERRADO', 'CANCELADO'
      type: DataTypes.STRING(50), // O ENUM
      allowNull: false,
      defaultValue: 'ABIERTO'
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_creacion'
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_actualizacion'
    },
    subtotal: { // Calculado a partir de los items
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // O true si se calcula después
      defaultValue: 0.00
    },
    idRestaurante: { // Para fácil consulta por restaurante
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Restaurante', key: 'idRestaurante' },
      field: 'idRestaurante'
    }
     // El total se manejaría en el Pago/Factura incluyendo impuestos/propinas
  }, {
    tableName: 'pedido',
    // Usar los campos de fecha existentes en lugar de createdAt/updatedAt
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  Pedido.associate = (models) => {
    Pedido.belongsTo(models.Mesa, { foreignKey: 'idMesa' });
    Pedido.belongsTo(models.Usuario, { foreignKey: 'idUsuario' }); // Alias 'Mesero' o 'Creador'
    Pedido.belongsTo(models.Restaurante, { foreignKey: 'idRestaurante' });
    // Pedido.belongsTo(models.Usuario, { as: 'Cliente', foreignKey: 'idCliente'}); // Si cliente es Usuario

    // Un Pedido tiene muchos Items de Pedido
    Pedido.hasMany(models.ItemPedido, { foreignKey: 'idPedido' });
    // Un Pedido tiene (o puede tener) un Pago asociado
    Pedido.hasOne(models.Pago, { foreignKey: 'idPedido' });
  };

  return Pedido;
};
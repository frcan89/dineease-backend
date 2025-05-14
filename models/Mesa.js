const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mesa = sequelize.define('Mesa', {
    idMesa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idMesa'
    },
    numero: { // Número o nombre de la mesa
      type: DataTypes.INTEGER, // O STRING si usas nombres como 'Barra 1'
      allowNull: false,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('Reservada', 'Ocupada', 'Fuera de Servicio', 'Libre'),
      allowNull: false,
      defaultValue: 'Libre',
    },
    ubicacion: { // 'Terraza', 'Salón Principal', 'Barra'
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    idRestaurante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Restaurante', key: 'idRestaurante' },
      field: 'idRestaurante'
    }
    // pedidoActivo no es una columna, es una relación lógica
  }, {
    tableName: 'mesa',
    timestamps: false, // Generalmente no se necesita saber cuándo se creó/modificó la mesa física
    // Unique constraint para número y restaurante
    indexes: [
        {
            unique: true,
            fields: ['numero', 'idRestaurante']
        }
    ]
  });

  Mesa.associate = (models) => {
    Mesa.belongsTo(models.Restaurante, { foreignKey: 'idRestaurante' });
    // Una Mesa puede tener muchos Pedidos (historial)
    Mesa.hasMany(models.Pedido, { foreignKey: 'idMesa' });
    // Podrías añadir una relación para el pedido activo si lo modelas explícitamente
    // Mesa.belongsTo(models.Pedido, { foreignKey: 'idPedidoActivo', constraints: false });
  };

  return Mesa;
};
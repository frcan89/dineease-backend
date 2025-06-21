// models/Mesa.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mesa = sequelize.define('Mesa', {
    id_mesa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero: { // Puede ser un número o un identificador como 'Barra 1'
      type: DataTypes.INTEGER, // Si solo son números. Si pueden ser alfanuméricos, usa STRING.
      allowNull: false,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: true, // DDL dice DEFAULT 2, pero puede ser null si no se especifica y se usa el default
      defaultValue: 2,
    },
    estado: {
      type: DataTypes.ENUM('Libre', 'Ocupada', 'Reservada', 'Fuera de Servicio'),
      allowNull: false,
      defaultValue: 'Libre',
    },
    ubicacion: { // Ej: 'Terraza', 'Salón Principal', 'Junto a la ventana'
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    id_restaurante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Restaurante', // Nombre del modelo Restaurante
        key: 'idRestaurante', // PK en tu modelo Restaurante (o id_restaurante si así lo tienes)
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
    tableName: 'mesa',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true, // Habilita eliminación lógica
    deletedAt: 'fecha_eliminacion', // Columna para paranoid

    // Para reflejar UNIQUE KEY `uq_mesa_restaurante_numero` (`id_restaurante`,`numero`)
    indexes: [
      {
        unique: true,
        fields: ['id_restaurante', 'numero']
      }
    ]
  });

  Mesa.associate = (models) => {
    Mesa.belongsTo(models.Restaurante, { foreignKey: 'id_restaurante' });
    // Una Mesa puede tener muchos Pedidos (historial de pedidos en esa mesa)
    Mesa.hasMany(models.Pedido, { foreignKey: 'id_mesa' });
    // Si quieres una referencia al pedido activo actual en la mesa (más complejo de mantener):
    // Mesa.belongsTo(models.Pedido, { foreignKey: 'id_pedido_activo', as: 'pedidoActivo', constraints: false, allowNull: true });
  };

  // Hooks para sincronizar 'eliminado' con 'fecha_eliminacion'
  Mesa.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  Mesa.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return Mesa;
};
// models/Menu.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Menu = sequelize.define('Menu', {
    id_menu: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    costo_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo de producción del menú completo si aplica',
    },
    precio_venta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Precio de venta del menú',
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Activo',
      comment: 'Ej: Activo, Inactivo, Promoción',
    },
    id_restaurante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Restaurante',
        key: 'id_restaurante', // PK en tu modelo Restaurante
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
  }, {
    tableName: 'menu',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    paranoid: true,
    deletedAt: 'fecha_eliminacion',
  });

  Menu.associate = (models) => {
    Menu.belongsTo(models.Restaurante, { foreignKey: 'id_restaurante' });
    // Un Menú tiene muchos Items de Menú
    Menu.hasMany(models.ItemMenu, {
      foreignKey: 'id_menu',
      as: 'items', // Alias para acceder a los items
    });
  };

  Menu.addHook('afterDestroy', async (instance, options) => {
    await instance.update({ eliminado: true }, { hooks: false, transaction: options.transaction });
  });
  Menu.addHook('afterRestore', async (instance, options) => {
    await instance.update({ eliminado: false }, { hooks: false, transaction: options.transaction });
  });

  return Menu;
};
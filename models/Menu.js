const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Menu = sequelize.define('Menu', {
    idMenu: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idMenu'
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // costo y precio no parecen estar en esta tabla según tu descripción inicial
    estado: { // 'ACTIVO', 'INACTIVO', 'BORRADOR'
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'), // Ajusta valores
      allowNull: false,
      defaultValue: 'ACTIVO'
    },
    idRestaurante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Restaurante', key: 'idRestaurante' },
      field: 'idRestaurante'
    }
  }, {
    tableName: 'menu',
    timestamps: true,
  });

  Menu.associate = (models) => {
    Menu.belongsTo(models.Restaurante, { foreignKey: 'idRestaurante' });
    // Un Menú tiene muchos Items de Menú
    Menu.hasMany(models.ItemMenu, { foreignKey: 'idMenu' });
  };

  return Menu;
};
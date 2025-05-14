const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permiso = sequelize.define('Permiso', {
    idPermiso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idPermiso'
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true // El nombre del permiso suele ser único
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    tableName: 'permiso',
    timestamps: false,
  });

  Permiso.associate = (models) => {
    // Un Permiso pertenece a muchos Roles a través de RolPermiso
    Permiso.belongsToMany(models.Rol, {
      through: 'RolPermiso', // Nombre exacto de la tabla intermedia
      foreignKey: 'idPermiso',
      otherKey: 'idRol',
      timestamps: false
    });
  };

  return Permiso;
};
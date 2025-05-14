const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rol = sequelize.define('Rol', {
    idRol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idRol'
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true // Generalmente el nombre del rol es único
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
    // No incluimos 'permisos' directamente aquí, se maneja con la tabla intermedia
  }, {
    tableName: 'rol',
    timestamps: false, // Usualmente los roles no necesitan timestamps
  });

  Rol.associate = (models) => {
    // Un Rol puede tener muchos Usuarios
    Rol.hasMany(models.Usuario, { foreignKey: 'idRol' });
    // Un Rol tiene muchos Permisos a través de RolPermiso
    Rol.belongsToMany(models.Permiso, {
      through: 'RolPermiso', // Nombre exacto de la tabla intermedia
      foreignKey: 'idRol',
      otherKey: 'idPermiso',
      timestamps: false // La tabla intermedia usualmente no necesita timestamps
    });
  };

  return Rol;
};
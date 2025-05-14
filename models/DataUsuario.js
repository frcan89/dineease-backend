const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DataUsuario = sequelize.define('DataUsuario', {
    idDataUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idDataUsuario'
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Clave foránea única para relación 1-a-1
      references: {
        model: 'Usuario',
        key: 'idUsuario'
      },
      field: 'idUsuario'
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    documento_identidad: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'documento_identidad'
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false, // La fecha de registro debería estar
      defaultValue: DataTypes.NOW, // Establecer por defecto al crear
      field: 'fecha_registro'
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    tableName: 'data_usuario', // Nombre exacto
    timestamps: false // Ya tenemos fecha_registro
  });

  DataUsuario.associate = (models) => {
    // DataUsuario pertenece a un Usuario
    DataUsuario.belongsTo(models.Usuario, { foreignKey: 'idUsuario' });
  };

  return DataUsuario;
};
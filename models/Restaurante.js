// models/Restaurante.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Restaurante = sequelize.define('Restaurante', {
    // ASUMIENDO QUE CAMBIASTE 'id restaurante' a 'id_restaurante' EN LA BD:
    id_restaurante: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_restaurante' // O el nombre exacto que uses en la BD
    },
    // SI NO PUDISTE CAMBIAR EL NOMBRE EN LA BD (NO RECOMENDADO):
    // id_restaurante: {
    //   type: DataTypes.INTEGER,
    //   primaryKey: true,
    //   autoIncrement: true,
    //   field: 'id restaurante' // CON ESPACIO, ASEGÚRATE DE QUE FUNCIONE
    // },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    colores_primarios: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'colores_primarios'
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Nuevas columnas de tu DDL
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Sequelize puede manejar esto
      field: 'fecha_creacion'
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Sequelize puede manejar esto
      field: 'fecha_actualizacion'
    },
    eliminado: {
      type: DataTypes.BOOLEAN, // tinyint(1) se mapea bien a BOOLEAN
      allowNull: false,
      defaultValue: false,
    },
    fecha_eliminacion: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_eliminacion'
    }
  }, {
    tableName: 'restaurante',
    // Sequelize maneja 'createdAt' y 'updatedAt' por defecto.
    // Si tus columnas se llaman exactamente 'fecha_creacion' y 'fecha_actualizacion'
    // Y QUIERES que Sequelize las gestione (en lugar de la BD con DEFAULT CURRENT_TIMESTAMP):
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    // O SI LA BASE DE DATOS GESTIONA ESTOS TIMESTAMPS COMPLETAMENTE (recomendado si usas DEFAULT CURRENT_TIMESTAMP)
    // timestamps: false, // Y no los defines aquí arriba, solo 'eliminado' y 'fecha_eliminacion'

    // Para el borrado lógico:
    paranoid: true, // Habilita el borrado lógico
    deletedAt: 'fecha_eliminacion', // Indica a Sequelize qué columna usar para la marca de tiempo de eliminación
                                    // Sequelize también esperará una columna 'eliminado' de tipo BOOLEAN si 'deletedAt' es una fecha.
                                    // O si solo usas 'eliminado' (BOOLEAN):
                                    // deletedAt: 'eliminado', // Y asegúrate que tu columna 'eliminado' sea un booleano
                                    // Es un poco confuso cómo Sequelize maneja esto si no sigues su convención exacta.
                                    // La forma más simple con tu DDL es:
                                    // timestamps: false, (porque la BD los maneja)
                                    // Y luego manejar 'eliminado' y 'fecha_eliminacion' manualmente en el servicio, o:
                                    // paranoid: true,
                                    // deletedAt: 'fecha_eliminacion', // Esto implica que Sequelize buscará también un campo booleano para la bandera.
                                    // La opción paranoid: true y deletedAt: 'fecha_eliminacion' esperará que cuando se "elimine"
                                    // se establezca una fecha en `fecha_eliminacion`.
                                    // El campo `eliminado` (booleano) lo tendrías que gestionar tú o adaptar
                                    // para que funcione con el defaultScope de Sequelize para `paranoid`.
  });

  // Configuración para borrado lógico (paranoid)
  // Esto asegura que las consultas por defecto solo traigan registros no eliminados.
  // Si tienes `eliminado` como BOOLEAN y `fecha_eliminacion` como DATE:
  // 1. `paranoid: true`
  // 2. `deletedAt: 'fecha_eliminacion'`
  // Sequelize al hacer `destroy()` pondrá una fecha en `fecha_eliminacion`.
  // Para que el `defaultScope` funcione correctamente con tu columna `eliminado` (booleano),
  // necesitarías que `destroy()` también ponga `eliminado = 1`.
  // Esto se puede hacer con hooks o gestionarlo en el servicio.

  // Si decides usar `timestamps: true` y dejar que Sequelize gestione `createdAt` y `updatedAt`
  // asegúrate que tus columnas se llamen `createdAt` y `updatedAt` o usa `createdAt: 'fecha_creacion'`, etc.
  // Dado tu DDL con `DEFAULT CURRENT_TIMESTAMP`, es más simple poner `timestamps: false`
  // y dejar que la BD los maneje, y solo definir los campos en el modelo sin `defaultValue: DataTypes.NOW`.

  // RECOMENDACIÓN SIMPLIFICADA DADO TU DDL:
  // ... (definición de columnas como arriba, pero sin defaultValue para fechas)
  // }, {
  //   tableName: 'restaurante',
  //   timestamps: false, // La BD maneja fecha_creacion y fecha_actualizacion
  //   // Para borrado lógico con tu estructura actual:
  //   // No uses `paranoid: true` directamente si no quieres que Sequelize
  //   // intente gestionar `deletedAt` de forma específica. En su lugar,
  //   // filtra manualmente en los servicios o usa scopes.
  //   // O ajusta la lógica de `destroy()` en el servicio.

  // RECOMENDACIÓN CON PARANOID (ajustando cómo funciona `eliminado`):
  // }, {
  //   tableName: 'restaurante',
  //   timestamps: true, // Sequelize maneja
  //   createdAt: 'fecha_creacion',
  //   updatedAt: 'fecha_actualizacion',
  //   paranoid: true,
  //   deletedAt: 'fecha_eliminacion' // Sequelize pondrá fecha aquí al borrar
  //   // Y deberás asegurarte que `eliminado` (booleano) se actualice también,
  //   // o que tu columna `deletedAt` (fecha_eliminacion) sea suficiente para filtrar.
  //   // El `defaultScope` de paranoid filtra por `deletedAt IS NULL`.
  // });


  Restaurante.associate = (models) => {
    // Asociaciones existentes
    Restaurante.hasMany(models.Usuario, { foreignKey: 'id_restaurante' });
    // ... otras asociaciones
  };

  return Restaurante;
};
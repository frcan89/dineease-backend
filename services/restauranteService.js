const db = require('../models'); // Ajusta la ruta si es necesario
const { Op } = require('sequelize');

const restauranteService = {
  /**
   * Crea un nuevo restaurante.
   * @param {object} datosRestaurante - Datos del restaurante (nombre, logo, etc.).
   * @returns {Promise<object>} El objeto del restaurante creado.
   */
  async crearRestaurante(datosRestaurante) {
    try {
      if (!datosRestaurante.nombre) {
        const error = new Error('El nombre del restaurante es obligatorio.');
        error.status = 400;
        throw error;
      }

      const existente = await db.Restaurante.findOne({
        where: { nombre: datosRestaurante.nombre },
        paranoid: false, // Buscar también entre los eliminados para evitar duplicados de nombre
      });
      if (existente) {
        // Si el restaurante existente está eliminado, podrías ofrecer restaurarlo o lanzar error
        if (existente.fecha_eliminacion) { // O existente.eliminado === true
             const error = new Error(`Ya existe un restaurante con el nombre '${datosRestaurante.nombre}' pero está eliminado. Considere restaurarlo.`);
             error.status = 409;
             throw error;
        }
        const error = new Error('Ya existe un restaurante con ese nombre.');
        error.status = 409; // Conflict
        throw error;
      }

      // Sequelize se encargará de 'fecha_creacion' y 'fecha_actualizacion'
      // 'eliminado' tendrá su valor por defecto (false)
      // 'fecha_eliminacion' será null
      const nuevoRestaurante = await db.Restaurante.create(datosRestaurante);
      return nuevoRestaurante;
    } catch (error) {
      console.error('Error al crear restaurante en el servicio:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  /**
   * Obtiene todos los restaurantes activos (no eliminados lógicamente).
   * El filtro `paranoid: true` en el modelo se aplica por defecto.
   * @param {object} filtros - Opciones de filtrado (limite, pagina, nombre).
   * @returns {Promise<object>} Objeto con total, lista, página actual y total de páginas.
   */
  async obtenerTodosLosRestaurantes(filtros = {}) {
    try {
      const { limite = 10, pagina = 1, nombre, incluirEliminados = false } = filtros;
      const offset = (pagina - 1) * limite;
      const whereClause = {};

      if (nombre) {
        whereClause.nombre = { [Op.like]: `%${nombre}%` };
      }

      // Si no se usa 'paranoid: true' en el modelo, se necesitaría:
      // whereClause.eliminado = false;

      const { count, rows } = await db.Restaurante.findAndCountAll({
        where: whereClause,
        limit: parseInt(limite, 10),
        offset: parseInt(offset, 10),
        order: [['nombre', 'ASC']],
        paranoid: !incluirEliminados, // Si incluirEliminados es true, paranoid se desactiva para esta consulta
      });

      return {
        totalRestaurantes: count,
        restaurantes: rows,
        paginaActual: parseInt(pagina, 10),
        totalPaginas: Math.ceil(count / limite),
      };
    } catch (error) {
      console.error('Error al obtener todos los restaurantes en el servicio:', error);
      error.status = 500;
      throw error;
    }
  },

  /**
   * Obtiene un restaurante activo por su ID.
   * @param {number} id_restaurante - El ID del restaurante.
   * @param {boolean} incluirEliminados - Si es true, busca también entre los eliminados.
   * @returns {Promise<object|null>} El objeto del restaurante o null si no se encuentra.
   */
  async obtenerRestaurantePorId(id_restaurante, incluirEliminados = false) {
    try {
      const restaurante = await db.Restaurante.findByPk(id_restaurante, {
        paranoid: !incluirEliminados,
        // include: [...] // Incluir modelos asociados si es necesario
      });
      // Si no se usa 'paranoid: true' en el modelo y se filtra manualmente:
      // if (restaurante && restaurante.eliminado && !incluirEliminados) return null;
      return restaurante;
    } catch (error) {
      console.error('Error al obtener restaurante por ID en el servicio:', error);
      error.status = 500;
      throw error;
    }
  },

  /**
   * Actualiza un restaurante existente.
   * @param {number} id_restaurante - El ID del restaurante a actualizar.
   * @param {object} datosActualizacion - Los datos a actualizar.
   * @returns {Promise<object|null>} El objeto del restaurante actualizado o null si no se encuentra.
   */
  async actualizarRestaurante(id_restaurante, datosActualizacion) {
    try {
      // Busca el restaurante, incluso si está "eliminado" lógicamente, para permitir
      // la actualización de un restaurante eliminado antes de restaurarlo si fuera necesario.
      // O, si solo se permite actualizar activos, no usar paranoid: false.
      const restaurante = await db.Restaurante.findByPk(id_restaurante, { paranoid: false });
      if (!restaurante) {
        const error = new Error('Restaurante no encontrado.');
        error.status = 404;
        throw error;
      }

      // Si el restaurante está eliminado y se intenta modificar algo más que 'eliminado' o 'fecha_eliminacion'
      // (para restaurarlo), podría ser un error.
      if (restaurante.fecha_eliminacion && !(datosActualizacion.hasOwnProperty('eliminado') || datosActualizacion.hasOwnProperty('fecha_eliminacion'))) {
          // Aquí podrías decidir si permites la actualización de un restaurante "eliminado" o no.
          // Por ahora, lo permitiremos, pero es una consideración de negocio.
      }


      if (datosActualizacion.nombre && datosActualizacion.nombre !== restaurante.nombre) {
        const existente = await db.Restaurante.findOne({
          where: {
            nombre: datosActualizacion.nombre,
            id_restaurante: { [Op.ne]: id_restaurante },
          },
          paranoid: false, // Verificar contra todos, incluso eliminados, para nombres únicos
        });
        if (existente) {
          const error = new Error('Ya existe otro restaurante con ese nombre.');
          error.status = 409;
          throw error;
        }
      }

      // Sequelize actualizará 'fecha_actualizacion' automáticamente si timestamps: true
      await restaurante.update(datosActualizacion);
      return restaurante;
    } catch (error) {
      console.error('Error al actualizar restaurante en el servicio:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  /**
   * Elimina lógicamente un restaurante.
   * Establece 'fecha_eliminacion' (manejado por paranoid:true) y también 'eliminado'=true.
   * @param {number} id_restaurante - El ID del restaurante a eliminar.
   * @returns {Promise<boolean>} True si se eliminó, false si no se encontró.
   */
  async eliminarRestaurante(id_restaurante) {
    const transaction = await db.sequelize.transaction(); // Iniciar transacción
    try {
      const restaurante = await db.Restaurante.findByPk(id_restaurante, { transaction });
      if (!restaurante) {
        await transaction.rollback();
        return false;
      }

      // Verificar dependencias (ejemplo: usuarios)
      const usuariosAsociados = await db.Usuario.count({
        where: { id_restaurante, /* eliminado: false */ }, // Considera si los usuarios también tienen borrado lógico
        transaction
      });
      if (usuariosAsociados > 0) {
        await transaction.rollback();
        const error = new Error('No se puede eliminar el restaurante porque tiene usuarios asociados.');
        error.status = 409;
        throw error;
      }
      // Añadir más verificaciones de dependencias aquí (Productos, Mesas, Menus, etc.)

      // `destroy()` con `paranoid: true` establecerá `fecha_eliminacion`
      await restaurante.destroy({ transaction });

      // Actualizar explícitamente la columna 'eliminado' a true
      // ya que `paranoid` solo maneja la columna especificada en `deletedAt`.
      await restaurante.update({ eliminado: true }, { transaction, paranoid: false }); // paranoid: false para actualizar un registro "ya eliminado" por destroy

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar restaurante en el servicio:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  /**
   * Restaura un restaurante eliminado lógicamente.
   * Establece 'fecha_eliminacion' a null (manejado por paranoid:true) y 'eliminado'=false.
   * @param {number} id_restaurante - El ID del restaurante a restaurar.
   * @returns {Promise<object|null>} El objeto del restaurante restaurado o null.
   */
  async restaurarRestaurante(id_restaurante) {
    const transaction = await db.sequelize.transaction();
    try {
      // Buscar el restaurante incluyendo los eliminados
      const restaurante = await db.Restaurante.findByPk(id_restaurante, {
        paranoid: false, // Necesario para encontrar uno "eliminado"
        transaction
      });

      if (!restaurante) {
        await transaction.rollback();
        const error = new Error('Restaurante no encontrado.');
        error.status = 404;
        throw error;
      }

      if (!restaurante.fecha_eliminacion && !restaurante.eliminado) { // Verificar si realmente está eliminado
        await transaction.rollback();
        const error = new Error('El restaurante no está eliminado.');
        error.status = 400;
        throw error;
      }

      // `restore()` con `paranoid: true` establecerá `fecha_eliminacion` a NULL
      await restaurante.restore({ transaction });

      // Actualizar explícitamente la columna 'eliminado' a false
      await restaurante.update({ eliminado: false }, { transaction }); // No es necesario paranoid:false aquí ya que restore() lo "des-elimina"

      await transaction.commit();
      // Volver a obtener el restaurante para devolverlo con el estado actualizado
      return await db.Restaurante.findByPk(id_restaurante);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al restaurar restaurante en el servicio:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },
};

module.exports = restauranteService;
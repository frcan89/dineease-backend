const db = require('../models'); // Ajusta la ruta si es necesario
const { Op } = require('sequelize'); // Para operadores de consulta como 'o', 'y', etc.

const userService = {
  /**
   * Crea un nuevo usuario.
   * @param {object} datosUsuario - Datos del usuario a crear (nombre, email, contraseña, idRol, idRestaurante, etc.).
   * @returns {Promise<object>} El objeto del usuario creado (sin la contraseña).
   * @throws {Error} Si el email ya existe o hay un error de base de datos.
   */
  async crearUsuario(datosUsuario) {
    try {
      // Verificar si el email ya existe
      const usuarioExistente = await db.Usuario.findOne({
        where: { email: datosUsuario.email },
      });

      if (usuarioExistente) {
        const error = new Error('El correo electrónico ya está registrado.');
        error.status = 409; // Conflict
        throw error;
      }

      // El hashing de la contraseña se hace con el hook 'beforeSave' en el modelo Usuario
      const nuevoUsuario = await db.Usuario.create(datosUsuario);

      // Si también se crea DataUsuario al mismo tiempo
      if (datosUsuario.dataAdicional) { // Suponiendo que envías dataAdicional
        await db.DataUsuario.create({
          ...datosUsuario.dataAdicional,
          idUsuario: nuevoUsuario.idUsuario,
          fecha_registro: new Date(), // Asegurar fecha_registro si no se pasa
        });
      }

      // No devolver la contraseña
      const { contraseña, ...usuarioSinPassword } = nuevoUsuario.get({ plain: true });
      return usuarioSinPassword;
    } catch (error) {
      console.error('Error al crear usuario en el servicio:', error);
      // Si el error ya tiene un status, lo respetamos
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  /**
   * Obtiene un usuario por su ID.
   * @param {number} userId - El ID del usuario.
   * @returns {Promise<object|null>} El objeto del usuario o null si no se encuentra.
   */
  async obtenerUsuarioPorId(userId) {
    try {
      const usuario = await db.Usuario.findByPk(userId, {
        attributes: { exclude: ['contraseña'] }, // Excluir contraseña
        include: [
          { model: db.Rol, attributes: ['idRol', 'nombre'] }, // Incluir información del rol
          { model: db.DataUsuario }, // Incluir datos adicionales del usuario
          { model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] }
        ],
      });
      return usuario;
    } catch (error) {
      console.error('Error al obtener usuario por ID en el servicio:', error);
      error.status = 500;
      throw error;
    }
  },

  /**
   * Obtiene un usuario por su email (usado para login).
   * Incluye la contraseña porque es necesario para la verificación.
   * @param {string} email - El email del usuario.
   * @returns {Promise<object|null>} El objeto del usuario (con contraseña) o null si no se encuentra.
   */
  async obtenerUsuarioPorEmailConPassword(email) {
    try {
      const usuario = await db.Usuario.findOne({
        where: { email },
        include: [
          { model: db.Rol, attributes: ['idRol', 'nombre'] },
          { model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] }
        ]
      });
      return usuario; // Devuelve el usuario con la contraseña hasheada
    } catch (error) {
      console.error('Error al obtener usuario por email en el servicio:', error);
      error.status = 500;
      throw error;
    }
  },

  /**
   * Obtiene todos los usuarios.
   * @param {object} filtros - Opciones de filtrado y paginación.
   * @returns {Promise<Array<object>>} Un array de objetos de usuario.
   */
  async obtenerTodosLosUsuarios(filtros = {}) {
    try {
      const { limite = 10, pagina = 1, idRestaurante, idRol, estado } = filtros;
      const offset = (pagina - 1) * limite;
      const whereClause = {};

      if (idRestaurante) {
        whereClause.idRestaurante = idRestaurante;
      }
      if (idRol) {
        whereClause.idRol = idRol;
      }
      if (estado !== undefined) { // Para permitir filtrar por estado true o false
        whereClause.estado = estado;
      }

      const { count, rows } = await db.Usuario.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['contraseña'] },
        include: [
            { model: db.Rol, attributes: ['idRol', 'nombre'] },
            { model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] }
        ],
        limit: parseInt(limite, 10),
        offset: parseInt(offset, 10),
        order: [['nombre', 'ASC']], // Ordenar por nombre por defecto
      });

      return {
        totalUsuarios: count,
        usuarios: rows,
        paginaActual: parseInt(pagina, 10),
        totalPaginas: Math.ceil(count / limite)
      };

    } catch (error) {
      console.error('Error al obtener todos los usuarios en el servicio:', error);
      error.status = 500;
      throw error;
    }
  },

  /**
   * Actualiza un usuario existente.
   * @param {number} userId - El ID del usuario a actualizar.
   * @param {object} datosActualizacion - Los datos a actualizar.
   * @returns {Promise<object|null>} El objeto del usuario actualizado o null si no se encuentra.
   */
  async actualizarUsuario(userId, datosActualizacion) {
    try {
      const usuario = await db.Usuario.findByPk(userId);
      if (!usuario) {
        const error = new Error('Usuario no encontrado.');
        error.status = 404;
        throw error;
      }

      // No permitir actualizar el email a uno que ya exista por otro usuario
      if (datosActualizacion.email && datosActualizacion.email !== usuario.email) {
        const emailExistente = await db.Usuario.findOne({ where: { email: datosActualizacion.email } });
        if (emailExistente) {
          const error = new Error('El nuevo correo electrónico ya está registrado por otro usuario.');
          error.status = 409;
          throw error;
        }
      }

      // Si se actualiza la contraseña, el hook 'beforeSave' la hasheará.
      // Actualizar DataUsuario si se proveen datos
      if (datosActualizacion.dataAdicional) {
        let dataUsuario = await db.DataUsuario.findOne({ where: { idUsuario: userId }});
        if (dataUsuario) {
            await dataUsuario.update(datosActualizacion.dataAdicional);
        } else {
            await db.DataUsuario.create({ ...datosActualizacion.dataAdicional, idUsuario: userId });
        }
        delete datosActualizacion.dataAdicional; // Para no intentar actualizarlo en Usuario
      }

      await usuario.update(datosActualizacion);

      // Devolver el usuario actualizado sin la contraseña
      const { contraseña, ...usuarioActualizadoSinPassword } = usuario.get({ plain: true });
      return usuarioActualizadoSinPassword;

    } catch (error) {
      console.error('Error al actualizar usuario en el servicio:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  /**
   * Elimina un usuario (o lo marca como inactivo).
   * @param {number} userId - El ID del usuario a eliminar.
   * @returns {Promise<boolean>} True si se eliminó/desactivó, false si no se encontró.
   */
  async eliminarUsuario(userId) {
    try {
      const usuario = await db.Usuario.findByPk(userId);
      if (!usuario) {
        return false; // O lanzar error 404
      }

      // Opción 1: Eliminación lógica (marcar como inactivo)
      await usuario.update({ estado: false });
      // Opción 2: Eliminación física (si es necesario y seguro)
      // await usuario.destroy();

      return true;
    } catch (error) {
      console.error('Error al eliminar usuario en el servicio:', error);
      error.status = 500;
      throw error;
    }
  },

  // Podrías añadir más funciones como:
  // - asignarRolAUsuario(userId, rolId)
  // - cambiarEstadoUsuario(userId, nuevoEstado)
};

module.exports = userService;
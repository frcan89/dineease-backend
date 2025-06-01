const userService = require('../services/userService'); // Ajusta la ruta

const userController = {
  /**
   * Crea un nuevo usuario (generalmente por un administrador).
   * POST /api/usuarios
   * Body: { nombre, email, password, idRol, idRestaurante, dataAdicional: { ... } }
   * Requiere autenticación y autorización (ej. solo admin).
   */
  async handleCrearUsuario(req, res, next) {
    try {
      const datosUsuario = req.body;
      // Validación de datos (similar a authController.handleRegistrar)
      if (!datosUsuario.email || !datosUsuario.password_hash || !datosUsuario.nombre || !datosUsuario.id_rol) {
        const error = new Error('Faltan campos obligatorios para crear el usuario.');
        error.status = 400;
        throw error;
      }

      const nuevoUsuario = await userService.crearUsuario(datosUsuario);
      res.status(201).json({
        message: 'Usuario creado exitosamente.',
        data: nuevoUsuario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene todos los usuarios con filtros y paginación.
   * GET /api/usuarios?limite=10&pagina=1&idRestaurante=X&idRol=Y&estado=true
   * Requiere autenticación.
   */
  async handleObtenerTodosLosUsuarios(req, res, next) {
    try {
      const { limite, pagina, idRestaurante, idRol, estado } = req.query;
      const filtros = {
        limite: limite ? parseInt(limite, 10) : undefined,
        pagina: pagina ? parseInt(pagina, 10) : undefined,
        idRestaurante: idRestaurante ? parseInt(idRestaurante, 10) : undefined,
        idRol: idRol ? parseInt(idRol, 10) : undefined,
        estado: estado !== undefined ? (estado === 'true' || estado === '1') : undefined
      };

      const resultado = await userService.obtenerTodosLosUsuarios(filtros);
      res.status(200).json({
        message: 'Usuarios obtenidos exitosamente.',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene un usuario específico por su ID.
   * GET /api/usuarios/:id
   * Requiere autenticación.
   */
  async handleObtenerUsuarioPorId(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        const error = new Error('ID de usuario inválido.');
        error.status = 400;
        throw error;
      }

      const usuario = await userService.obtenerUsuarioPorId(userId);
      if (!usuario) {
        const error = new Error('Usuario no encontrado.');
        error.status = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Usuario obtenido exitosamente.',
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualiza un usuario existente.
   * PUT /api/usuarios/:id
   * Body: { nombre, email, idRol, estado, dataAdicional: { ... } } (ejemplo, la contraseña se maneja aparte)
   * Requiere autenticación y autorización (ej. el propio usuario o un admin).
   */
  async handleActualizarUsuario(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        const error = new Error('ID de usuario inválido.');
        error.status = 400;
        throw error;
      }
      const datosActualizacion = req.body;

      // No permitir actualizar la contraseña directamente aquí para mayor seguridad
      // Se podría tener un endpoint específico para cambiar contraseña
      if (datosActualizacion.hasOwnProperty('contraseña')) {
        delete datosActualizacion.contraseña; // O lanzar un error
      }

      const usuarioActualizado = await userService.actualizarUsuario(userId, datosActualizacion);
      res.status(200).json({
        message: 'Usuario actualizado exitosamente.',
        data: usuarioActualizado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cambia la contraseña de un usuario.
   * PUT /api/usuarios/:id/cambiar-password
   * Body: { passwordActual, nuevaPassword }
   * Requiere autenticación (el propio usuario).
   */
  async handleChangePassword(req, res, next) {
    try {
        const userId = parseInt(req.params.id, 10);
        const { passwordActual, nuevaPassword } = req.body;

        // Verificar que el usuario que hace la solicitud es el mismo del ID (o un admin)
        // Esto usualmente se haría con la información de req.user (del token JWT)
        if (req.user.id !== userId /* && !req.user.esAdmin */) { // req.user.esAdmin es un ejemplo
            const error = new Error('No autorizado para cambiar la contraseña de este usuario.');
            error.status = 403; // Forbidden
            throw error;
        }

        if (!passwordActual || !nuevaPassword) {
            const error = new Error('Se requiere la contraseña actual y la nueva contraseña.');
            error.status = 400;
            throw error;
        }
        // Aquí se necesitaría una función en userService para cambiar contraseña que:
        // 1. Obtenga el usuario con su password actual.
        // 2. Verifique la 'passwordActual'.
        // 3. Si es correcta, actualice el campo 'contraseña' con la 'nuevaPassword' (el hook la hasheará).
        // Por simplicidad, asumimos que `actualizarUsuario` puede manejarlo si se le pasa la contraseña,
        // pero un servicio dedicado es mejor.
        // await userService.cambiarPassword(userId, passwordActual, nuevaPassword);
        // Como alternativa, si `actualizarUsuario` hashea la contraseña si se envía:
        const usuario = await userService.obtenerUsuarioPorEmailConPassword(req.user.email); // Obtener el usuario con su hash
        if(!usuario || !(await usuario.validarPassword(passwordActual))) {
            const error = new Error('La contraseña actual es incorrecta.');
            error.status = 401;
            throw error;
        }

        await userService.actualizarUsuario(userId, { contraseña: nuevaPassword });


        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        next(error);
    }
  },

  /**
   * Elimina un usuario (o lo desactiva).
   * DELETE /api/usuarios/:id
   * Requiere autenticación y autorización (ej. solo admin).
   */
  async handleEliminarUsuario(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        const error = new Error('ID de usuario inválido.');
        error.status = 400;
        throw error;
      }

      const resultado = await userService.eliminarUsuario(userId);
      if (!resultado) {
        const error = new Error('Usuario no encontrado para eliminar.');
        error.status = 404;
        throw error;
      }
      res.status(200).json({ message: 'Usuario desactivado/eliminado exitosamente.' });
    } catch (error) {
      next(error);
    }
  },
    async handleChangePassword(req, res, next) {
    try {
        const userId = parseInt(req.params.id, 10);
        // Asegurar que el usuario autenticado es quien modifica su contraseña o es un admin
        if (req.user.id !== userId /* && !esAdmin(req.user.id_rol) */) {
            const error = new Error('No autorizado.'); error.status = 403; throw error;
        }
        const { passwordActual, nuevaPassword } = req.body;
        if (!passwordActual || !nuevaPassword) {
            const error = new Error('Se requiere contraseña actual y nueva.'); error.status = 400; throw error;
        }
        await userService.cambiarPassword(userId, passwordActual, nuevaPassword);
        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (error) { next(error); }
  },

  async handleEliminarUsuario(req, res, next) {
    try {
      // Idealmente, un admin no debería poder eliminarse a sí mismo,
      // o debería haber una confirmación especial.
      const userId = parseInt(req.params.id, 10);
      await userService.eliminarUsuario(userId);
      res.status(200).json({ message: 'Usuario eliminado (lógicamente) exitosamente.' });
    } catch (error) { next(error); }
  },

  async handleRestaurarUsuario(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const usuarioRestaurado = await userService.restaurarUsuario(userId);
      res.status(200).json({
        message: 'Usuario restaurado exitosamente.',
        data: usuarioRestaurado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtiene el perfil del usuario autenticado.
   * GET /api/usuarios/perfil
   * Requiere autenticación.
   */
  async handleObtenerPerfil(req, res, next) {
    try {
        // req.user es establecido por el middleware de autenticación
        if (!req.user || !req.user.id) {
            const error = new Error('No se pudo identificar al usuario desde el token.');
            error.status = 401;
            throw error;
        }
        const usuarioId = req.user.id;
        const perfil = await userService.obtenerUsuarioPorId(usuarioId);

        if (!perfil) {
            const error = new Error('Perfil de usuario no encontrado.');
            error.status = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Perfil obtenido exitosamente.',
            data: perfil
        });
    } catch (error) {
        next(error);
    }
  }
};

module.exports = userController;
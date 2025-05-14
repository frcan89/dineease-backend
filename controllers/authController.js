const authService = require('../services/authService'); // Ajusta la ruta

const authController = {
  /**
   * Maneja el registro de un nuevo usuario.
   * POST /api/auth/register
   * Body: { nombre, email, password, idRol, idRestaurante, dataAdicional: { ... } } (ejemplo)
   */
  async handleRegistrar(req, res, next) {
    try {
      const datosUsuario = req.body;
      // Aquí podrías añadir validación de datos con Joi, express-validator, etc.
      // Ejemplo básico:
      if (!datosUsuario.email || !datosUsuario.password || !datosUsuario.nombre || !datosUsuario.idRol || !datosUsuario.idRestaurante) {
        const error = new Error('Faltan campos obligatorios para el registro.');
        error.status = 400; // Bad Request
        throw error;
      }

      const { usuario, token } = await authService.registrar(datosUsuario);
      res.status(201).json({
        message: 'Usuario registrado exitosamente.',
        data: {
          usuario,
          token,
        },
      });
    } catch (error) {
      // Pasa el error al middleware de manejo de errores global
      next(error);
    }
  },

  /**
   * Maneja el inicio de sesión de un usuario.
   * POST /api/auth/login
   * Body: { email, password }
   */
  async handleLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const error = new Error('Email y contraseña son requeridos.');
        error.status = 400;
        throw error;
      }

      const { token, usuario } = await authService.login(email, password);
      res.status(200).json({
        message: 'Inicio de sesión exitoso.',
        data: {
          token,
          usuario,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * (Opcional) Endpoint para verificar la validez de un token (protegido)
   * GET /api/auth/verify-token (requiere middleware de autenticación)
   */
  async handleVerificarToken(req, res, next) {
    try {
      // El middleware de autenticación ya debería haber verificado el token
      // y añadido req.user con el payload decodificado.
      // Si llegamos aquí, el token es válido.
      res.status(200).json({
        message: 'Token válido.',
        data: {
          usuario: req.user, // req.user es establecido por el authMiddleware
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Podrías añadir controladores para:
  // - handleSolicitarRestablecimientoPassword
  // - handleRestablecerPassword
};

module.exports = authController;
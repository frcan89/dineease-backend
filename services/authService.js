const jwt = require('jsonwebtoken');
const db = require('../models'); // Ajusta la ruta si es necesario
const userService = require('./userService'); // Usaremos userService para obtener el usuario

// Deberías guardar tu secreto JWT en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_secreto_para_desarrollo';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Tiempo de expiración del token
console.log("Longitud de JWT_SECRET:", JWT_SECRET.length);

const authService = {
  /**
   * Registra un nuevo usuario.
   * @param {object} datosUsuario - Datos del usuario a registrar.
   * @returns {Promise<object>} El objeto del usuario creado (sin contraseña) y el token.
   */
  async registrar(datosUsuario) {
    try {
      // userService.crearUsuario ya maneja la validación de email y el hashing
      const nuevoUsuario = await userService.crearUsuario(datosUsuario);

      // Generar token para el nuevo usuario
      const payload = {
        id: nuevoUsuario.idUsuario,
        email: nuevoUsuario.email,
        idRol: nuevoUsuario.idRol, // Asumiendo que crearUsuario devuelve esto
        idRestaurante: nuevoUsuario.idRestaurante
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return {
        usuario: nuevoUsuario, // Ya viene sin contraseña de userService
        token,
      };
    } catch (error) {
      console.error('Error en el servicio de registro:', error);
      // El error ya debería tener un status si viene de userService
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  /**
   * Inicia sesión de un usuario.
   * @param {string} email - El email del usuario.
   * @param {string} password - La contraseña del usuario.
   * @returns {Promise<object>} Un objeto con el token y la información del usuario (sin contraseña).
   * @throws {Error} Si las credenciales son inválidas o el usuario no existe/está inactivo.
   */
  async login(email, password) {
    try {
      const usuario = await userService.obtenerUsuarioPorEmailConPassword(email);

      if (!usuario) {
        const error = new Error('Credenciales inválidas.');
        error.status = 401; // Unauthorized
        throw error;
      }

      if (!usuario.estado) { // Verificar si el usuario está activo
        const error = new Error('La cuenta de usuario está inactiva.');
        error.status = 403; // Forbidden
        throw error;
      }

      // El modelo Usuario tiene el método 'validarPassword'
      const esPasswordValido = await usuario.validarPassword(password);

      if (!esPasswordValido) {
        const error = new Error('Credenciales inválidas.' );
        error.status = 401;
        throw error;
      }

      // Generar el token JWT
      const payload = {
        id: usuario.id_usuario,
        email: usuario.email,
        idRol: usuario.Rol ? usuario.Rol.id_rol : null, // Acceder al rol incluido
        nombreRol: usuario.Rol ? usuario.Rol.nombre : null,
        idRestaurante: usuario.Restaurante ? usuario.Restaurante.id_restaurante : null,
        nombreRestaurante: usuario.Restaurante ? usuario.Restaurante.nombre : null
        // Puedes añadir más información relevante al payload si es necesario
        // pero mantenlo ligero.
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // Actualizar ultimo_acceso
      await usuario.update({ ultimo_acceso: new Date() });

      // Devolver información del usuario sin la contraseña
      const { contraseña, ...usuarioSinPassword } = usuario.get({ plain: true });

      return {
        token,
        usuario: { // Devuelve un objeto de usuario limpio
            idUsuario: usuarioSinPassword.idUsuario,
            nombre: usuarioSinPassword.nombre,
            email: usuarioSinPassword.email,
            estado: usuarioSinPassword.estado,
            ultimo_acceso: usuarioSinPassword.ultimo_acceso,
            Rol: usuarioSinPassword.Rol, // Incluye el objeto Rol si está presente
            Restaurante: usuarioSinPassword.Restaurante, // Incluye el objeto Restaurante
            // No incluir contraseña ni otros datos sensibles
        },
      };
    } catch (error) {
      console.error('Error en el servicio de login:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  /**
   * Verifica un token JWT.
   * @param {string} token - El token JWT a verificar.
   * @returns {Promise<object>} El payload decodificado del token.
   * @throws {Error} Si el token es inválido o ha expirado.
   */
  async verificarToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      console.error('Error al verificar token:', error.name, error.message);
      const err = new Error('Token inválido o expirado.');
      if (error.name === 'TokenExpiredError') {
        err.message = 'El token ha expirado.';
      } else if (error.name === 'JsonWebTokenError') {
        err.message = 'Token inválido.';
      }
      err.status = 401; // Unauthorized
      throw err;
    }
  }

  // Podrías añadir funciones como:
  // - solicitarRestablecimientoPassword(email)
  // - restablecerPassword(tokenRestablecimiento, nuevaPassword)
};

module.exports = authService;
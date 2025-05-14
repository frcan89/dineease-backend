const jwt = require('jsonwebtoken');
const db =require('../models'); // Para verificar si el usuario aún existe (opcional pero recomendado)

// Deberías obtener esto de tus variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_secreto_para_desarrollo';

const authMiddleware = {
  /**
   * Middleware para verificar el token JWT.
   * Espera un token en la cabecera 'Authorization' con el formato 'Bearer <token>'.
   */
  async verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { message: 'Acceso no autorizado. Token no proporcionado o formato incorrecto.' },
      });
    }

    const token = authHeader.split(' ')[1]; // Extraer el token de 'Bearer <token>'

    if (!token) {
      return res.status(401).json({
        error: { message: 'Acceso no autorizado. Token no proporcionado.' },
      });
    }

    try {
      // Verificar el token usando el secreto
      const decoded = jwt.verify(token, JWT_SECRET);

      // Opcional pero recomendado: Verificar si el usuario del token aún existe en la BD
      // y si está activo. Esto previene que tokens válidos de usuarios eliminados/desactivados
      // sigan funcionando.
      const usuario = await db.Usuario.findOne({
        where: { idUsuario: decoded.id, estado: true }, // Asegúrate de que el usuario esté activo
        attributes: ['idUsuario', 'email', 'idRol', 'idRestaurante', 'estado'] // Solo atributos necesarios
      });

      if (!usuario) {
        return res.status(401).json({
          error: { message: 'Acceso no autorizado. Usuario no encontrado o inactivo.' },
        });
      }

      // Adjuntar el payload decodificado (y/o la información del usuario de la BD) al objeto request
      // Es común adjuntar solo el payload del token o una versión limpia del usuario.
      req.user = { // Lo que estará disponible en req.user en los controladores
        id: usuario.idUsuario,
        email: usuario.email,
        idRol: usuario.idRol,
        idRestaurante: usuario.idRestaurante
        // Puedes añadir más campos del 'decoded' o del 'usuario' si son necesarios
        // para la autorización o la lógica de negocio posterior.
      };

      next(); // Continuar con el siguiente middleware o controlador
    } catch (error) {
      console.error('Error de autenticación - Token inválido:', error.name, error.message);
      let errorMessage = 'Acceso no autorizado. Token inválido o expirado.';
      let statusCode = 401;

      if (error.name === 'TokenExpiredError') {
        errorMessage = 'El token ha expirado. Por favor, inicie sesión de nuevo.';
        statusCode = 401; // O podrías usar 403 si prefieres
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Token inválido.';
        statusCode = 401;
      } else if (error.name === 'NotBeforeError') {
        errorMessage = 'Token aún no activo.';
        statusCode = 401;
      }
      // Si el error no es de jwt, podría ser un error interno (ej. de la BD)
      // El middleware de errores global lo manejará si no establecemos status aquí.

      return res.status(statusCode).json({
        error: { message: errorMessage },
      });
    }
  },

  // (Opcional) Podrías tener un middleware de autorización aquí también,
  // o en un archivo separado como 'authorizationMiddleware.js'.
  // Ejemplo:
  // permitirRoles(rolesPermitidosArray) {
  //   return (req, res, next) => {
  //     if (!req.user || !req.user.idRol) {
  //       return res.status(403).json({ error: { message: 'Acción no permitida. Rol de usuario no definido.' } });
  //     }
  //     // Necesitarías cargar el nombre del rol si solo tienes idRol, o comparar por idRol
  //     // const rolDelUsuario = req.user.Rol.nombre; // Si el rol está populado en req.user
  //     if (rolesPermitidosArray.includes(req.user.idRol)) { // Asumiendo que comparas por idRol
  //       next();
  //     } else {
  //       return res.status(403).json({ error: { message: 'Acción no permitida para tu rol de usuario.' } });
  //     }
  //   };
  // }
};

module.exports = authMiddleware;
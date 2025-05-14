const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Ajusta la ruta
const authMiddleware = require('../middlewares/authMiddleware'); // Asumiendo que lo crearemos
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware'); // Para autorización por roles/permisos

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para la gestión de usuarios (requiere autenticación y en algunos casos, autorización específica)
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Usuario: # Definición básica para Swagger, puedes expandirla
 *       type: object
 *       properties:
 *         idUsuario:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "Admin User"
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *         estado:
 *           type: boolean
 *           example: true
 *         idRol:
 *           type: integer
 *           example: 1
 *         Rol:
 *           type: object
 *           properties:
 *             idRol:
 *               type: integer
 *             nombre:
 *               type: string
 *         idRestaurante:
 *           type: integer
 *         Restaurante:
 *           type: object
 *           properties:
 *             idRestaurante:
 *               type: integer
 *             nombre:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Aplicar middleware de autenticación a todas las rutas de usuarios
// O puedes aplicarlo individualmente si algunas rutas son públicas
router.use(authMiddleware.verificarToken); // ¡Importante! Esto protege todas las rutas de abajo

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Perfil no encontrado
 */
router.get('/perfil', userController.handleObtenerPerfil);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario (protegido, requiere rol admin por ejemplo)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             # Misma schema que en /api/auth/register pero sin el token en la respuesta
 *             $ref: '#/components/schemas/UsuarioInput' # Crear este schema si es diferente
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (sin permisos suficientes)
 */
router.post('/', /* authorizationMiddleware.permitir(['admin']), */ userController.handleCrearUsuario); // Ejemplo de autorización

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtiene una lista de todos los usuarios (protegido)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de usuarios por página
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: idRestaurante
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de restaurante
 *       - in: query
 *         name: idRol
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de rol
 *       - in: query
 *         name: estado
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (true/false)
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida
 *       401:
 *         description: No autorizado
 */
router.get('/', /* authorizationMiddleware.permitir(['admin', 'gerente']), */ userController.handleObtenerTodosLosUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID (protegido)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', userController.handleObtenerUsuarioPorId);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario por su ID (protegido)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               idRol:
 *                 type: integer
 *               estado:
 *                 type: boolean
 *               dataAdicional:
 *                 type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos o ID de usuario inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (intentando actualizar un usuario sin permiso)
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Conflicto (ej. email ya en uso por otro usuario)
 */
router.put('/:id', userController.handleActualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}/cambiar-password:
 *   put:
 *     summary: Cambia la contraseña del usuario autenticado (o de otro si es admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario cuya contraseña se cambiará
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordActual
 *               - nuevaPassword
 *             properties:
 *               passwordActual:
 *                 type: string
 *                 format: password
 *               nuevaPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Faltan contraseñas o ID inválido
 *       401:
 *         description: No autorizado o contraseña actual incorrecta
 *       403:
 *         description: Prohibido cambiar contraseña de otro usuario (si no es admin)
 */
router.put('/:id/cambiar-password', userController.handleChangePassword);


/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina (o desactiva) un usuario por su ID (protegido, requiere rol admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado/desactivado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', /* authorizationMiddleware.permitir(['admin']), */ userController.handleEliminarUsuario);

module.exports = router;
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para la gestión de usuarios
 */

// Aplicar middleware de autenticación a todas las rutas de usuarios
//router.use(authMiddleware.verificarToken);

/**
 * @swagger
 * /usuarios/perfil:
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
 *             schema: # Schema de respuesta para el perfil
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Usuario' # El schema Usuario ya incluye el perfil
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Perfil no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/perfil', userController.handleObtenerPerfil);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario (generalmente por un administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                  data:
 *                      $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (sin permisos suficientes)
 *       409:
 *         description: Conflicto (ej. email ya existe)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// router.post('/', authorizationMiddleware.permitir(['admin']), userController.handleCrearUsuario);
router.post('/', userController.handleCrearUsuario);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtiene una lista de todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de usuario
 *       - in: query
 *         name: idRestaurante # DDL usa id_restaurante, asegúrate de que el servicio lo mapee si es necesario
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de restaurante
 *       - in: query
 *         name: idRol # DDL usa id_rol
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de rol
 *       - in: query
 *         name: estado
 *         schema:
 *           type: boolean # true o false
 *         description: Filtrar por estado del usuario (activo/inactivo)
 *       - in: query
 *         name: incluirEliminados
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir usuarios eliminados lógicamente
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsuarios:
 *                   type: integer
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *                 paginaActual:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 *       401:
 *         description: No autorizado
 */
// router.get('/', authorizationMiddleware.permitir(['admin', 'gerente']), userController.handleObtenerTodosLosUsuarios);
router.get('/', userController.handleObtenerTodosLosUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
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
 *       - in: query
 *         name: incluirEliminados
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir si el usuario está eliminado lógicamente
 *     responses:
 *       200:
 *         description: Usuario obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                  data:
 *                      $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', userController.handleObtenerUsuarioPorId);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario por su ID
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
 *             $ref: '#/components/schemas/UsuarioUpdate' # Usar un schema específico para actualización
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  message:
 *                      type: string
 *                  data:
 *                      $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Conflicto (ej. email ya en uso)
 */
router.put('/:id', userController.handleActualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}/cambiar-password:
 *   put:
 *     summary: Cambia la contraseña del usuario
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
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado o contraseña actual incorrecta
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id/cambiar-password', userController.handleChangePassword);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina (lógicamente) un usuario por su ID
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
 *         description: Usuario eliminado (lógicamente) exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Usuario no encontrado o ya eliminado
 */
// router.delete('/:id', authorizationMiddleware.permitir(['admin']), userController.handleEliminarUsuario);
router.delete('/:id', userController.handleEliminarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}/restaurar:
 *   put:
 *     summary: Restaura un usuario eliminado lógicamente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a restaurar
 *     responses:
 *       200:
 *         description: Usuario restaurado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: El usuario no está eliminado o ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Usuario no encontrado
 */
// router.put('/:id/restaurar', authorizationMiddleware.permitir(['admin']), userController.handleRestaurarUsuario);
router.put('/:id/restaurar', userController.handleRestaurarUsuario);

module.exports = router;
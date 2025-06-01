const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware'); // Para permisos

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles de usuario y asignación de permisos
 */

// Proteger todas las rutas de roles. Descomenta si no lo has hecho.
//router.use(authMiddleware.verificarToken);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crea un nuevo rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RolInput'
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rol'
 *       400:
 *         description: Datos inválidos (ej. falta nombre)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (sin permisos)
 *       409:
 *         description: Conflicto (ej. rol ya existe)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// router.post('/', authorizationMiddleware.permitir(['admin_sistema']), rolController.handleCrearRol);
router.post('/', rolController.handleCrearRol);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtiene una lista de todos los roles
 *     tags: [Roles]
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
 *         description: Filtrar por nombre del rol
 *       - in: query
 *         name: incluirEliminados
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir roles eliminados lógicamente
 *     responses:
 *       200:
 *         description: Lista de roles obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRoles:
 *                   type: integer
 *                 roles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rol'
 *                 paginaActual:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 *       401:
 *         description: No autorizado
 */
// router.get('/', authorizationMiddleware.permitir(['admin_sistema', 'gerente']), rolController.handleObtenerTodosLosRoles);
router.get('/', rolController.handleObtenerTodosLosRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtiene un rol por su ID, incluyendo sus permisos asignados
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol
 *       - in: query
 *         name: incluirEliminados
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Rol obtenido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rol' # El schema Rol ya debería incluir la propiedad Permisos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Rol no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// router.get('/:id', authorizationMiddleware.permitir(['admin_sistema', 'gerente']), rolController.handleObtenerRolPorId);
router.get('/:id', rolController.handleObtenerRolPorId);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Actualiza un rol existente por su ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RolInput'
 *     responses:
 *       200:
 *         description: Rol actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rol'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Rol no encontrado
 *       409:
 *         description: Conflicto (ej. nombre ya en uso)
 */
// router.put('/:id', authorizationMiddleware.permitir(['admin_sistema']), rolController.handleActualizarRol);
router.put('/:id', rolController.handleActualizarRol);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Elimina (lógicamente) un rol por su ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol a eliminar
 *     responses:
 *       200:
 *         description: Rol eliminado (lógicamente)
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
 *         description: Rol no encontrado o ya eliminado
 *       409:
 *         description: Conflicto (ej. rol asignado a usuarios)
 */
// router.delete('/:id', authorizationMiddleware.permitir(['admin_sistema']), rolController.handleEliminarRol);
router.delete('/:id', rolController.handleEliminarRol);

/**
 * @swagger
 * /api/roles/{id}/restaurar:
 *   put:
 *     summary: Restaura un rol eliminado lógicamente
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol a restaurar
 *     responses:
 *       200:
 *         description: Rol restaurado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rol'
 *       400:
 *         description: El rol no está eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Rol no encontrado
 */
// router.put('/:id/restaurar', authorizationMiddleware.permitir(['admin_sistema']), rolController.handleRestaurarRol);
router.put('/:id/restaurar', rolController.handleRestaurarRol);

/**
 * @swagger
 * /api/roles/{id}/permisos:
 *   put:
 *     summary: Asigna o actualiza los permisos para un rol específico
 *     description: Reemplaza todos los permisos existentes del rol con la lista proporcionada. Enviar un array vacío para quitar todos los permisos.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol al que se asignarán los permisos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idsPermisos
 *             properties:
 *               idsPermisos:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array de IDs de los permisos a asignar al rol.
 *                 example: [1, 2, 5]
 *     responses:
 *       200:
 *         description: Permisos asignados/actualizados exitosamente al rol
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rol' # Devuelve el rol con sus permisos actualizados
 *       400:
 *         description: Datos inválidos (ej. idsPermisos no es un array, o algún ID de permiso no existe)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Rol no encontrado
 */
// router.put('/:id/permisos', authorizationMiddleware.permitir(['admin_sistema']), rolController.handleAsignarPermisosARol);
router.put('/:id/permisos', rolController.handleAsignarPermisosARol);

module.exports = router;
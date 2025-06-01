const express = require('express');
const router = express.Router();
const permisoController = require('../controllers/permisoController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware'); // Para permisos específicos por rol

/**
 * @swagger
 * tags:
 *   name: Permisos
 *   description: Gestión de permisos del sistema (requiere autenticación y autorización específica)
 */

// Proteger todas las rutas de permisos con autenticación
//router.use(authMiddleware.verificarToken);

/**
 * @swagger
 * /api/permisos:
 *   post:
 *     summary: Crea un nuevo permiso
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermisoInput' # Asumiendo que tienes PermisoInputSchema.yaml
 *     responses:
 *       201:
 *         description: Permiso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permiso'
 *       400:
 *         description: Datos de entrada inválidos (ej. falta nombre)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado (token inválido o ausente)
 *       403:
 *         description: Prohibido (sin permisos suficientes para crear)
 *       409:
 *         description: Conflicto (ej. permiso con ese nombre ya existe)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Ejemplo con placeholder para autorización por rol:
// router.post('/', authorizationMiddleware.permitir(['admin_sistema']), permisoController.handleCrearPermiso);
router.post('/', permisoController.handleCrearPermiso);

/**
 * @swagger
 * /api/permisos:
 *   get:
 *     summary: Obtiene una lista de todos los permisos
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100 # Los permisos suelen ser menos, se pueden listar más
 *         description: Número de permisos por página
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del permiso
 *       - in: query
 *         name: incluirEliminados
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir permisos eliminados lógicamente en la respuesta
 *     responses:
 *       200:
 *         description: Lista de permisos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPermisos:
 *                   type: integer
 *                 permisos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permiso'
 *                 paginaActual:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 *       401:
 *         description: No autorizado
 */
router.get('/', permisoController.handleObtenerTodosLosPermisos);

/**
 * @swagger
 * /api/permisos/{id}:
 *   get:
 *     summary: Obtiene un permiso por su ID
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del permiso
 *       - in: query
 *         name: incluirEliminados
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir si el permiso está eliminado lógicamente
 *     responses:
 *       200:
 *         description: Permiso obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permiso'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Permiso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', permisoController.handleObtenerPermisoPorId);

/**
 * @swagger
 * /api/permisos/{id}:
 *   put:
 *     summary: Actualiza un permiso existente por su ID
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del permiso a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermisoInput'
 *     responses:
 *       200:
 *         description: Permiso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permiso'
 *       400:
 *         description: Datos inválidos o ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (sin permisos suficientes)
 *       404:
 *         description: Permiso no encontrado
 *       409:
 *         description: Conflicto (ej. nombre ya en uso)
 */
router.put('/:id', permisoController.handleActualizarPermiso);

/**
 * @swagger
 * /api/permisos/{id}:
 *   delete:
 *     summary: Elimina (lógicamente) un permiso por su ID
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del permiso a eliminar
 *     responses:
 *       200:
 *         description: Permiso eliminado (lógicamente) exitosamente
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
 *         description: Permiso no encontrado o ya eliminado
 *       409:
 *         description: Conflicto (ej. permiso asignado a roles activos)
 */
router.delete('/:id', permisoController.handleEliminarPermiso);

/**
 * @swagger
 * /api/permisos/{id}/restaurar:
 *   put:
 *     summary: Restaura un permiso eliminado lógicamente
 *     tags: [Permisos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del permiso a restaurar
 *     responses:
 *       200:
 *         description: Permiso restaurado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permiso'
 *       400:
 *         description: El permiso no está eliminado o ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Permiso no encontrado
 */
router.put('/:id/restaurar', permisoController.handleRestaurarPermiso);

module.exports = router;
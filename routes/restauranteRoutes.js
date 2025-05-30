const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restauranteController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Restaurantes
 *   description: Endpoints para la gestión de restaurantes
 */

// Aplicar middleware de autenticación a todas las rutas de restaurantes.
// Descomenta esta línea si todas las rutas deben ser protegidas por defecto.
router.use(authMiddleware.verificarToken);

/**
 * @swagger
 * /api/restaurantes:
 *   post:
 *     summary: Crea un nuevo restaurante
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestauranteInput' # Usar schema externo
 *     responses:
 *       201:
 *         description: Restaurante creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurante'
 *       400:
 *         description: Datos inválidos (ej. falta nombre)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (sin permisos para crear)
 *       409:
 *         description: Conflicto (ej. restaurante con ese nombre ya existe)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// router.post('/', authorizationMiddleware.permitir(['ROL_ADMIN_SISTEMA']), restauranteController.handleCrearRestaurante);
router.post('/', restauranteController.handleCrearRestaurante);

/**
 * @swagger
 * /api/restaurantes:
 *   get:
 *     summary: Obtiene una lista de todos los restaurantes
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: [] # O eliminar si esta ruta es pública
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de restaurantes por página
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
 *         description: Filtrar por nombre del restaurante
 *       - in: query
 *         name: incluirEliminados # NUEVO
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir restaurantes eliminados lógicamente
 *     responses:
 *       200:
 *         description: Lista de restaurantes obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRestaurantes:
 *                   type: integer
 *                 restaurantes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurante'
 *                 paginaActual:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 *       401:
 *         description: No autorizado (si la ruta está protegida)
 */
router.get('/', restauranteController.handleObtenerTodosLosRestaurantes);

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   get:
 *     summary: Obtiene un restaurante por su ID
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante
 *       - in: query
 *         name: incluirEliminados # NUEVO
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir si el restaurante está eliminado lógicamente
 *     responses:
 *       200:
 *         description: Restaurante obtenido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurante'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Restaurante no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', restauranteController.handleObtenerRestaurantePorId);

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   put:
 *     summary: Actualiza un restaurante por su ID
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestauranteInput' # Usar schema de entrada
 *     responses:
 *       200:
 *         description: Restaurante actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurante'
 *       400:
 *         description: Datos inválidos o ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Restaurante no encontrado
 *       409:
 *         description: Conflicto (ej. nombre ya en uso)
 */
// router.put('/:id', authorizationMiddleware.permitir(['ROL_ADMIN_SISTEMA']), restauranteController.handleActualizarRestaurante);
router.put('/:id', restauranteController.handleActualizarRestaurante);

/**
 * @swagger
 * /api/restaurantes/{id}/restaurar:
 *   put:
 *     summary: Restaura un restaurante eliminado lógicamente
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante a restaurar
 *     responses:
 *       200:
 *         description: Restaurante restaurado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurante'
 *       400:
 *         description: El restaurante no está eliminado o ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Restaurante no encontrado
 *       409:
 *         description: Conflicto (ej. restaurante ya está activo)
 */
// router.put('/:id/restaurar', authorizationMiddleware.permitir(['ROL_ADMIN_SISTEMA']), restauranteController.handleRestaurarRestaurante);
router.put('/:id/restaurar', restauranteController.handleRestaurarRestaurante);

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   delete:
 *     summary: Elimina (lógicamente) un restaurante por su ID
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del restaurante a eliminar
 *     responses:
 *       200:
 *         description: Restaurante eliminado (lógicamente) exitosamente
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
 *         description: Restaurante no encontrado o ya eliminado
 *       409:
 *         description: Conflicto (ej. tiene entidades asociadas activas)
 */
// router.delete('/:id', authorizationMiddleware.permitir(['ROL_ADMIN_SISTEMA']), restauranteController.handleEliminarRestaurante);
router.delete('/:id', restauranteController.handleEliminarRestaurante);

module.exports = router;
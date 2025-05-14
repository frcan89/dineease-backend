const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restauranteController'); // Ajusta la ruta
const authMiddleware = require('../middlewares/authMiddleware'); // Para proteger rutas
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware'); // Para permisos específicos

/**
 * @swagger
 * tags:
 *   name: Restaurantes
 *   description: Endpoints para la gestión de restaurantes
 */

// Aplicar middleware de autenticación a todas las rutas de restaurantes si es necesario.
// Si algunas son públicas (ej. listar restaurantes), aplícalo individualmente.
// Por ahora, asumimos que todas las operaciones de gestión de restaurantes requieren autenticación
// y un rol específico (ej. 'superadmin' o 'admin_sistema').
//router.use(authMiddleware.verificarToken);

/**
 * @swagger
 * /api/restaurantes:
 *   post:
 *     summary: Crea un nuevo restaurante
 *     tags: [Restaurantes]
 *     security:
 *       - bearerAuth: [] # Indica que esta ruta requiere autenticación JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "El Buen Sabor Central"
 *               logo:
 *                 type: string
 *                 example: "url_al_logo.png"
 *               colores_primarios:
 *                 type: string
 *                 example: "#FF5733, #33FF57"
 *               direccion:
 *                 type: string
 *                 example: "Avenida Siempre Viva 742"
 *               telefono:
 *                 type: string
 *                 example: "555-1234"
 *     responses:
 *       201:
 *         description: Restaurante creado exitosamente
 *       400:
 *         description: Datos inválidos (ej. falta nombre)
 *       401:
 *         description: No autorizado (token inválido o ausente)
 *       403:
 *         description: Prohibido (sin permisos para crear)
 *       409:
 *         description: Conflicto (ej. restaurante con ese nombre ya existe)
 */
// Ejemplo de cómo se podría aplicar autorización por rol:
// router.post('/', authorizationMiddleware.permitirRoles([ROLES.SUPERADMIN]), restauranteController.handleCrearRestaurante);
router.post('/', restauranteController.handleCrearRestaurante); // Simplificado por ahora

/**
 * @swagger
 * /api/restaurantes:
 *   get:
 *     summary: Obtiene una lista de todos los restaurantes
 *     tags: [Restaurantes]
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
 *         description: Filtrar por nombre del restaurante
 *     responses:
 *       200:
 *         description: Lista de restaurantes obtenida
 *       401:
 *         description: No autorizado
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
 *     responses:
 *       200:
 *         description: Restaurante obtenido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Restaurante no encontrado
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
 *             type: object
 *             properties: # Lista los campos actualizables
 *               nombre:
 *                 type: string
 *               logo:
 *                 type: string
 *               colores_primarios:
 *                 type: string
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurante actualizado
 *       400:
 *         description: Datos inválidos o ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (sin permisos para actualizar)
 *       404:
 *         description: Restaurante no encontrado
 *       409:
 *         description: Conflicto (ej. nombre ya en uso)
 */
// router.put('/:id', authorizationMiddleware.permitirRoles([ROLES.SUPERADMIN]), restauranteController.handleActualizarRestaurante);
router.put('/:id', restauranteController.handleActualizarRestaurante);

// PUT /api/restaurantes/:id/restaurar
router.put('/:id/restaurar', /* auth, authorization, */ restauranteController.handleRestaurarRestaurante);

/**
 * @swagger
 * /api/restaurantes/{id}:
 *   delete:
 *     summary: Elimina un restaurante por su ID
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
 *         description: Restaurante eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (sin permisos para eliminar)
 *       404:
 *         description: Restaurante no encontrado
 *       409:
 *         description: Conflicto (ej. tiene entidades asociadas)
 */
// router.delete('/:id', authorizationMiddleware.permitirRoles([ROLES.SUPERADMIN]), restauranteController.handleEliminarRestaurante);
router.delete('/:id', restauranteController.handleEliminarRestaurante);

module.exports = router;
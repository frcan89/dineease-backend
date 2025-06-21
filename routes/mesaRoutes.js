// routes/mesaRoutes.js
const express = require('express');
const router = express.Router();
const mesaController = require('../controllers/mesaController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Mesas
 *   description: Gestión de mesas del restaurante
 */

router.use(authMiddleware.verificarToken); // Todas las rutas de mesas requieren autenticación

/**
 * @swagger
 * /api/mesas:
 *   post:
 *     summary: Crea una nueva mesa
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MesaInput'
 *     responses:
 *       201: { description: "Mesa creada", content: { application/json: { schema: { $ref: '#/components/schemas/Mesa' }}}}
 *       400: { description: "Datos inválidos" }
 *       403: { description: "Prohibido (ej. usuario sin restaurante)" }
 *       409: { description: "Conflicto (mesa ya existe)" }
 */
// router.post('/', authorizationMiddleware.permitir(['admin_restaurante']), mesaController.handleCrearMesa);
router.post('/', mesaController.handleCrearMesa);

/**
 * @swagger
 * /api/mesas:
 *   get:
 *     summary: Obtiene todas las mesas del restaurante del usuario
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: limite, in: query, schema: { type: integer, default: 20 } }
 *       - { name: pagina, in: query, schema: { type: integer, default: 1 } }
 *       - { name: numero, in: query, schema: { type: integer } }
 *       - { name: estado, in: query, schema: { type: string, enum: [Libre, Ocupada, Reservada, 'Fuera de Servicio'] } }
 *       - { name: ubicacion, in: query, schema: { type: string } }
 *       - { name: capacidad_min, in: query, schema: { type: integer }, description: "Capacidad mínima de la mesa" }
 *       - { name: incluirEliminados, in: query, schema: { type: boolean, default: false } }
 *     responses:
 *       200:
 *         description: Lista de mesas
 *         content: { application/json: { schema: { type: object, properties: { totalMesas: {type: integer}, mesas: {type: array, items: {$ref: '#/components/schemas/Mesa'}}, paginaActual: {type: integer}, totalPaginas: {type: integer}}}}}
 */
router.get('/', mesaController.handleObtenerTodasLasMesas);

/**
 * @swagger
 * /api/mesas/{id}:
 *   get:
 *     summary: Obtiene una mesa por ID
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *       - { name: incluirEliminados, in: query, schema: { type: boolean, default: false } }
 *     responses:
 *       200: { description: "Mesa obtenida", content: { application/json: { schema: { $ref: '#/components/schemas/Mesa' }}}}
 *       404: { description: "Mesa no encontrada" }
 */
router.get('/:id', mesaController.handleObtenerMesaPorId);

/**
 * @swagger
 * /api/mesas/{id}:
 *   put:
 *     summary: Actualiza una mesa
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MesaInput' # Puede reutilizar el input o tener un MesaUpdateSchema
 *     responses:
 *       200: { description: "Mesa actualizada", content: { application/json: { schema: { $ref: '#/components/schemas/Mesa' }}}}
 *       409: { description: "Conflicto (ej. número de mesa duplicado)"}
 */
router.put('/:id', mesaController.handleActualizarMesa);

/**
 * @swagger
 * /api/mesas/{id}:
 *   delete:
 *     summary: Elimina (lógicamente) una mesa
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: "Mesa eliminada" }
 *       409: { description: "Conflicto (ej. mesa con pedidos activos)"}
 */
router.delete('/:id', mesaController.handleEliminarMesa);

/**
 * @swagger
 * /api/mesas/{id}/restaurar:
 *   put:
 *     summary: Restaura una mesa eliminada lógicamente
 *     tags: [Mesas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: "Mesa restaurada", content: { application/json: { schema: { $ref: '#/components/schemas/Mesa' }}}}
 *       400: { description: "La mesa no está eliminada" }
 */
router.put('/:id/restaurar', mesaController.handleRestaurarMesa);

module.exports = router;
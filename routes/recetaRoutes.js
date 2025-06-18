// routes/recetaRoutes.js
const express = require('express');
const router = express.Router();
const recetaController = require('../controllers/recetaController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Recetas
 *   description: Gestión de recetas y sus ingredientes
 */

router.use(authMiddleware.verificarToken);

/**
 * @swagger
 * /api/recetas:
 *   post:
 *     summary: Crea una nueva receta con sus ingredientes
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecetaInput'
 *     responses:
 *       201: { description: "Receta creada", content: { application/json: { schema: { $ref: '#/components/schemas/Receta' }}}}
 *       400: { description: "Datos inválidos" }
 *       401: { description: "No autorizado" }
 *       403: { description: "Prohibido (ej. usuario sin restaurante)" }
 *       409: { description: "Conflicto (receta ya existe)" }
 */
// router.post('/', authorizationMiddleware.permitir(['admin_restaurante', 'chef']), recetaController.handleCrearReceta);
router.post('/', recetaController.handleCrearReceta);

/**
 * @swagger
 * /api/recetas:
 *   get:
 *     summary: Obtiene todas las recetas del restaurante del usuario
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: limite, in: query, schema: { type: integer, default: 10 } }
 *       - { name: pagina, in: query, schema: { type: integer, default: 1 } }
 *       - { name: nombre, in: query, schema: { type: string } }
 *       - { name: incluirEliminados, in: query, schema: { type: boolean, default: false } }
 *     responses:
 *       200:
 *         description: Lista de recetas
 *         content: { application/json: { schema: { type: object, properties: { totalRecetas: {type: integer}, recetas: {type: array, items: {$ref: '#/components/schemas/Receta'}}, paginaActual: {type: integer}, totalPaginas: {type: integer}}}}}
 *       # ...
 */
router.get('/', recetaController.handleObtenerTodasLasRecetas);

/**
 * @swagger
 * /api/recetas/{id}:
 *   get:
 *     summary: Obtiene una receta por ID con sus ingredientes
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *       - { name: incluirEliminados, in: query, schema: { type: boolean, default: false } }
 *     responses:
 *       200: { description: "Receta obtenida", content: { application/json: { schema: { $ref: '#/components/schemas/Receta' }}}}
 *       404: { description: "Receta no encontrada" }
 *       # ...
 */
router.get('/:id', recetaController.handleObtenerRecetaPorId);

/**
 * @swagger
 * /api/recetas/{id}:
 *   put:
 *     summary: Actualiza una receta y sus ingredientes
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecetaInput' # El mismo input que para crear puede servir
 *     responses:
 *       200: { description: "Receta actualizada", content: { application/json: { schema: { $ref: '#/components/schemas/Receta' }}}}
 *       # ...
 */
router.put('/:id', recetaController.handleActualizarReceta);

/**
 * @swagger
 * /api/recetas/{id}:
 *   delete:
 *     summary: Elimina (lógicamente) una receta y sus ingredientes asociados
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: "Receta eliminada" }
 *       409: { description: "Conflicto (ej. receta en uso en item de menú activo)"}
 *       # ...
 */
router.delete('/:id', recetaController.handleEliminarReceta);

/**
 * @swagger
 * /api/recetas/{id}/restaurar:
 *   put:
 *     summary: Restaura una receta eliminada lógicamente
 *     tags: [Recetas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: "Receta restaurada", content: { application/json: { schema: { $ref: '#/components/schemas/Receta' }}}}
 *       # ...
 */
router.put('/:id/restaurar', recetaController.handleRestaurarReceta);

module.exports = router;
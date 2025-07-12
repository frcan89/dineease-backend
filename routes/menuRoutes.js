// routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Menús
 *   description: Gestión de menús y los items que los componen
 */

router.use(authMiddleware.verificarToken);

// --- Rutas para la entidad Menú (la cabecera) ---
/**
 * @swagger
 * /api/menus:
 *   post:
 *     summary: Crea un nuevo menú (sin items)
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuInput'
 *     responses:
 *       201: { description: "Menú creado", content: { application/json: { schema: { $ref: '#/components/schemas/Menu' }}}}
 */
router.post('/', menuController.handleCrearMenu);

/**
 * @swagger
 * /api/menus:
 *   get:
 *     summary: Obtiene todos los menús del restaurante
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: limite, in: query, schema: { type: integer, default: 10 } }
 *       - { name: pagina, in: query, schema: { type: integer, default: 1 } }
 *       - { name: nombre, in: query, schema: { type: string } }
 *       - { name: estado, in: query, schema: { type: string } }
 *       - { name: incluirEliminados, in: query, schema: { type: boolean, default: false } }
 *     responses:
 *       200: { description: "Lista de menús" }
 */
router.get('/', menuController.handleObtenerTodosLosMenus);

/**
 * @swagger
 * /api/menus/{id}:
 *   get:
 *     summary: Obtiene un menú por ID con sus items
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *       - { name: incluirEliminados, in: query, schema: { type: boolean, default: false } }
 *     responses:
 *       200: { description: "Menú obtenido", content: { application/json: { schema: { $ref: '#/components/schemas/Menu' }}}}
 *       404: { description: "Menú no encontrado" }
 */
router.get('/:id', menuController.handleObtenerMenuPorId);

/**
 * @swagger
 * /api/menus/{id}:
 *   put:
 *     summary: Actualiza los datos principales de un menú (nombre, precio, etc., pero no sus items)
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuInput' # El mismo input puede servir, o crear un MenuUpdateInput sin items
 *     responses:
 *       200: { description: "Datos del menú actualizados", content: { application/json: { schema: { $ref: '#/components/schemas/Menu' }}}}
 *       404: { description: "Menú no encontrado" }
 */
router.put('/:id', menuController.handleActualizarMenu);

router.delete('/:id', menuController.handleEliminarMenu);
router.put('/:id/restaurar', menuController.handleRestaurarMenu);

// --- Rutas para gestionar Items de Menú individualmente ---

/**
 * @swagger
 * /api/menus/{id}/items:
 *   post:
 *     summary: Añade un nuevo item (receta) a un menú existente
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, description: "ID del menú al que se añadirá el item", schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemMenuInput'
 *     responses:
 *       201: { description: "Item añadido", content: { application/json: { schema: { $ref: '#/components/schemas/ItemMenu' }}}}
 *       404: { description: "Menú o Receta no encontrados" }
 *       409: { description: "Conflicto, la receta ya está en el menú" }
 */
router.post('/:id/items', menuController.handleAnadirItemAMenu);

/**
 * @swagger
 * /api/menus/items/{id_item}:
 *   put:
 *     summary: Actualiza un item de menú específico (precio, disponibilidad)
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id_item, in: path, required: true, description: "ID del item de menú a actualizar", schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemMenuUpdateInput'
 *     responses:
 *       200: { description: "Item actualizado", content: { application/json: { schema: { $ref: '#/components/schemas/ItemMenu' }}}}
 *       404: { description: "Item de menú no encontrado" }
 */
router.put('/items/:id_item', menuController.handleActualizarItemDeMenu);

/**
 * @swagger
 * /api/menus/items/{id_item}:
 *   delete:
 *     summary: Elimina (lógicamente) un item de menú específico
 *     tags: [Menús]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id_item, in: path, required: true, description: "ID del item de menú a eliminar", schema: { type: integer } }
 *     responses:
 *       200: { description: "Item eliminado del menú" }
 *       404: { description: "Item de menú no encontrado" }
 */
router.delete('/items/:id_item', menuController.handleEliminarItemDeMenu);

module.exports = router;
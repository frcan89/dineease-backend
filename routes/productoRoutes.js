// routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos e insumos
 */

router.use(authMiddleware.verificarToken); // Todos los endpoints de productos requieren autenticación

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       # ... otros códigos de error 400, 401, 403, 409 ...
 */
// router.post('/', authorizationMiddleware.permitir(['admin_restaurante', 'chef']), productoController.handleCrearProducto);
router.post('/', productoController.handleCrearProducto);

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtiene una lista de productos (filtrada por el restaurante del usuario o un id_restaurante si es admin)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: nombre
 *         schema: { type: string }
 *       - in: query
 *         name: unidad_medida
 *         schema: { type: string }
 *       - in: query # Solo relevante si el usuario es superadmin y quiere ver de un restaurante específico
 *         name: id_restaurante
 *         schema: { type: integer }
 *         description: ID del restaurante para filtrar productos (solo para roles con permiso global).
 *       - in: query
 *         name: incluirEliminados
 *         schema: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object # Schema de paginación
 *               properties:
 *                 totalProductos: { type: integer }
 *                 productos: { type: array, items: { $ref: '#/components/schemas/Producto' } }
 *                 # ...
 *       # ... otros códigos de error ...
 */
router.get('/', productoController.handleObtenerTodosLosProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID (del restaurante del usuario)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query # Solo relevante si el usuario es superadmin y quiere ver de un restaurante específico donde el producto no es suyo
 *         name: id_restaurante
 *         schema: { type: integer }
 *         description: ID del restaurante (necesario si el producto no pertenece al restaurante del usuario autenticado y el usuario es admin global).
 *       - in: query
 *         name: incluirEliminados
 *         schema: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: Producto obtenido
 *         content: { application/json: { schema: { $ref: '#/components/schemas/Producto' } } }
 *       404:
 *         description: Producto no encontrado
 *       # ... otros códigos de error ...
 */
router.get('/:id', productoController.handleObtenerProductoPorId);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualiza un producto por su ID (del restaurante del usuario)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput' # O un ProductoUpdateSchema
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/Producto' } } }
 *       # ... otros códigos de error ...
 */
router.put('/:id', productoController.handleActualizarProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Elimina (lógicamente) un producto por su ID (del restaurante del usuario)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       # ... otros códigos de error ...
 */
router.delete('/:id', productoController.handleEliminarProducto);

/**
 * @swagger
 * /api/productos/{id}/restaurar:
 *   put:
 *     summary: Restaura un producto eliminado lógicamente (del restaurante del usuario)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Producto restaurado
 *         content: { application/json: { schema: { $ref: '#/components/schemas/Producto' } } }
 *       # ... otros códigos de error ...
 */
router.put('/:id/restaurar', productoController.handleRestaurarProducto);

module.exports = router;
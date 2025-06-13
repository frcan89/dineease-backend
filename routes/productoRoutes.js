const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming you have this
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware'); // For role-based access

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Endpoints para la gestión de productos del inventario
 */

// Apply authentication middleware to all product routes if needed
// router.use(authMiddleware.verificarToken);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: [] # Assuming JWT authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido (sin permisos suficientes)
 *       409:
 *         description: Conflicto (ej. producto con ese nombre ya existe en el restaurante)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Example with role authorization:
// router.post('/', authMiddleware.verificarToken, authorizationMiddleware.permitir(['ROL_ADMIN_RESTAURANTE', 'ROL_ENCARGADO_INVENTARIO']), productoController.handleCrearProducto);
router.post('/', authMiddleware.verificarToken, productoController.handleCrearProducto);


/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtiene una lista de productos
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de productos por página
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
 *         description: Filtrar por nombre del producto (búsqueda parcial)
 *       - in: query
 *         name: idRestaurante
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del restaurante (obligatorio para ciertos roles)
 *       - in: query
 *         name: incluirEliminados
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir productos eliminados lógicamente en los resultados
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductosPaginatedResponse'
 *       400:
 *         description: Parámetros de consulta inválidos (ej. idRestaurante faltante si es obligatorio)
 *       401:
 *         description: No autorizado
 */
router.get('/', authMiddleware.verificarToken, productoController.handleObtenerTodosLosProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *       - in: query
 *         name: incluirEliminados
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir si el producto está eliminado lógicamente
 *     responses:
 *       200:
 *         description: Producto obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authMiddleware.verificarToken, productoController.handleObtenerProductoPorId);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualiza un producto existente por su ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoInput' # Puede ser un schema específico para actualización
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos, ID de producto inválido o intento de cambiar idRestaurante
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: Conflicto (ej. nombre de producto ya en uso dentro del restaurante)
 */
router.put('/:id', authMiddleware.verificarToken, productoController.handleActualizarProducto);

/**
 * @swagger
 * /api/productos/{id}/restaurar:
 *   put:
 *     summary: Restaura un producto eliminado lógicamente
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a restaurar
 *     responses:
 *       200:
 *         description: Producto restaurado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: El producto no está eliminado o ID inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id/restaurar', authMiddleware.verificarToken, productoController.handleRestaurarProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Elimina (lógicamente) un producto por su ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado (lógicamente) exitosamente
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
 *         description: Producto no encontrado
 *       409:
 *         description: Conflicto (ej. el producto está siendo utilizado en recetas activas)
 */
router.delete('/:id', authMiddleware.verificarToken, productoController.handleEliminarProducto);

module.exports = router;

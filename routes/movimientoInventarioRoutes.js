// routes/movimientoInventarioRoutes.js
const express = require('express');
const router = express.Router();
const movimientoInventarioController = require('../controllers/movimientoInventarioController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

/**
 * @swagger
 * tags:
 *   name: InventarioMovimientos
 *   description: Gestión de movimientos de inventario y consulta de stock
 */

router.use(authMiddleware.verificarToken); // Todos los endpoints de inventario requieren autenticación

/**
 * @swagger
 * /api/inventario/movimientos:
 *   post:
 *     summary: Registra un nuevo movimiento de inventario (entrada, salida, ajuste)
 *     tags: [InventarioMovimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_producto
 *               - tipo_movimiento
 *               - cantidad_movida
 *             properties:
 *               id_producto:
 *                 type: integer
 *                 description: ID del producto afectado
 *               tipo_movimiento:
 *                 type: string
 *                 enum: [ENTRADA_COMPRA, ENTRADA_AJUSTE, ENTRADA_DEVOLUCION_CLIENTE, SALIDA_VENTA, SALIDA_CONSUMO_INTERNO, SALIDA_MERMA, SALIDA_AJUSTE, SALIDA_DEVOLUCION_PROVEEDOR]
 *                 description: Tipo de movimiento a registrar
 *               cantidad_movida:
 *                 type: integer
 *                 description: Cantidad (positiva) que se mueve. El tipo define si suma o resta.
 *                 minimum: 1
 *               precio_compra_unitario_movimiento:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *                 description: Precio de compra unitario (solo para ENTRADA_COMPRA, actualiza precio del producto)
 *               motivo:
 *                 type: string
 *                 nullable: true
 *                 description: Razón o descripción del movimiento
 *     responses:
 *       201:
 *         description: Movimiento registrado y stock actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     movimiento: { $ref: '#/components/schemas/MovimientoInventario' }
 *                     inventarioActualizado: { $ref: '#/components/schemas/Inventario' }
 *                     productoActualizado: { $ref: '#/components/schemas/Producto', nullable: true }
 *       400: { description: "Datos inválidos", content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' }}}}
 *       401: { description: "No autorizado" }
 *       403: { description: "Prohibido (ej. usuario sin restaurante)" }
 *       404: { description: "Producto no encontrado" }
 */
// router.post('/movimientos', authorizationMiddleware.permitir(['admin_restaurante', 'encargado_inventario']), movimientoInventarioController.handleRegistrarMovimiento);
router.post('/movimientos', movimientoInventarioController.handleRegistrarMovimiento);

/**
 * @swagger
 * /api/inventario/productos/{id_producto}/movimientos:
 *   get:
 *     summary: Obtiene el historial de movimientos de un producto específico
 *     tags: [InventarioMovimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_producto
 *         required: true
 *         schema: { type: integer }
 *         description: ID del producto
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: tipo_movimiento
 *         schema: { type: string, enum: [ENTRADA_COMPRA, ENTRADA_AJUSTE, SALIDA_VENTA, SALIDA_AJUSTE] } # etc.
 *       - in: query
 *         name: fechaDesde
 *         schema: { type: string, format: date } # YYYY-MM-DD
 *       - in: query
 *         name: fechaHasta
 *         schema: { type: string, format: date } # YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Lista de movimientos del producto
 *         content:
 *           application/json:
 *             schema: # Schema de paginación
 *               type: object
 *               properties:
 *                  totalMovimientos: {type: integer}
 *                  movimientos: {type: array, items: {$ref: '#/components/schemas/MovimientoInventario'}}
 *                  # ...
 *       401: { description: "No autorizado" }
 *       403: { description: "Prohibido" }
 *       404: { description: "Producto no encontrado" }
 */
router.get('/productos/:id_producto/movimientos', movimientoInventarioController.handleObtenerMovimientosDeProducto);

/**
 * @swagger
 * /api/inventario/productos/{id_producto}/stock:
 *   get:
 *     summary: Obtiene el stock actual de un producto específico
 *     tags: [InventarioMovimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_producto
 *         required: true
 *         schema: { type: integer }
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Stock actual del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: {type: string}
 *                 data: {$ref: '#/components/schemas/Inventario'} # O un schema más simple solo con cantidad
 *       401: { description: "No autorizado" }
 *       403: { description: "Prohibido" }
 *       404: { description: "Producto no encontrado" }
 */
router.get('/productos/:id_producto/stock', movimientoInventarioController.handleObtenerStockActual);


module.exports = router;
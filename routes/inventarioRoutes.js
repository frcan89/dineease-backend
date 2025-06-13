const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const authMiddleware = require('../middlewares/authMiddleware'); // Asegúrate que la ruta sea correcta

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: Gestión de inventario de productos.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InventarioInput:
 *       type: object
 *       required:
 *         - idProducto
 *         - cantidad
 *       properties:
 *         idProducto:
 *           type: integer
 *           description: ID del producto asociado a este inventario.
 *         cantidad:
 *           type: integer
 *           description: Cantidad disponible en inventario.
 *         ubicacion:
 *           type: string
 *           description: Ubicación del item en el almacén.
 *         proveedor:
 *           type: string
 *           description: Nombre del proveedor del producto.
 *         precio_compra:
 *           type: number
 *           format: float
 *           description: Precio de compra del producto.
 *         fecha_adquisicion:
 *           type: string
 *           format: date-time
 *           description: Fecha en que se adquirió el producto.
 *     Inventario:
 *       type: object
 *       properties:
 *         idInventario:
 *           type: integer
 *           description: ID único del inventario.
 *         idProducto:
 *           type: integer
 *           description: ID del producto asociado.
 *         producto:
 *           $ref: '#/components/schemas/Producto' # Asumiendo que tienes un schema Producto
 *         cantidad:
 *           type: integer
 *         ubicacion:
 *           type: string
 *         proveedor:
 *           type: string
 *         precio_compra:
 *           type: number
 *           format: float
 *         fecha_adquisicion:
 *           type: string
 *           format: date-time
 *         ultima_actualizacion:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje de error.
 */

// Aplicar middleware de autenticación (descomentar para activar)
// router.use(authMiddleware.verificarToken);

/**
 * @swagger
 * /api/inventario:
 *   post:
 *     summary: Crear un nuevo item de inventario.
 *     tags: [Inventario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventarioInput'
 *     responses:
 *       201:
 *         description: Item de inventario creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventario'
 *       400:
 *         description: Datos de entrada inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', /* authMiddleware.verificarToken, */ inventarioController.handleCrearInventario);

/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Obtener todos los items de inventario.
 *     tags: [Inventario]
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Número de items a devolver.
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *         description: Número de página para la paginación.
 *       - in: query
 *         name: idProducto
 *         schema:
 *           type: integer
 *         description: Filtrar inventario por ID de producto.
 *     responses:
 *       200:
 *         description: Lista de items de inventario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 rows:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inventario'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', /* authMiddleware.verificarToken, */ inventarioController.handleObtenerTodosLosInventarios);

/**
 * @swagger
 * /api/inventario/{idInventario}:
 *   get:
 *     summary: Obtener un item de inventario por su ID.
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: idInventario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item de inventario.
 *     responses:
 *       200:
 *         description: Item de inventario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventario'
 *       404:
 *         description: Item de inventario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:idInventario', /* authMiddleware.verificarToken, */ inventarioController.handleObtenerInventarioPorId);

/**
 * @swagger
 * /api/inventario/producto/{idProducto}:
 *   get:
 *     summary: Obtener un item de inventario por ID de Producto.
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: idProducto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto.
 *     responses:
 *       200:
 *         description: Item de inventario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventario'
 *       404:
 *         description: Item de inventario no encontrado para el producto especificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/producto/:idProducto', /* authMiddleware.verificarToken, */ inventarioController.handleObtenerInventarioPorIdProducto);

/**
 * @swagger
 * /api/inventario/{idInventario}:
 *   put:
 *     summary: Actualizar un item de inventario existente.
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: idInventario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item de inventario a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventarioInput' # Podría ser un schema parcial para actualización
 *     responses:
 *       200:
 *         description: Item de inventario actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventario'
 *       400:
 *         description: Datos de entrada inválidos.
 *       404:
 *         description: Item de inventario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:idInventario', /* authMiddleware.verificarToken, */ inventarioController.handleActualizarInventario);

/**
 * @swagger
 * /api/inventario/{idInventario}:
 *   delete:
 *     summary: Eliminar un item de inventario.
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: idInventario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del item de inventario a eliminar.
 *     responses:
 *       200:
 *         description: Item de inventario eliminado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *       204:
 *         description: Item de inventario eliminado exitosamente (sin contenido).
 *       404:
 *         description: Item de inventario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:idInventario', /* authMiddleware.verificarToken, */ inventarioController.handleEliminarInventario);

module.exports = router;

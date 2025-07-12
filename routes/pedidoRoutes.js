// routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestión completa del ciclo de vida de los pedidos
 */

// Todas las rutas de pedidos están protegidas y requieren un token de autenticación
router.use(authMiddleware.verificarToken);

// --- Rutas que operan sobre el Pedido como un todo ---

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crea un nuevo pedido con una lista inicial de menús
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PedidoInput'
 *     responses:
 *       201: { description: "Pedido creado exitosamente", content: { application/json: { schema: { $ref: '#/components/schemas/Pedido' }}}}
 *       400: { description: "Datos inválidos (ej. items faltantes, menú no válido)" }
 *       404: { description: "Recurso no encontrado (mesa, cliente, menú)" }
 *       409: { description: "Conflicto (ej. la mesa ya está ocupada)" }
 */
router.post('/', pedidoController.handleCrearPedido);

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Obtiene una lista paginada de todos los pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: limite, in: query, schema: { type: integer, default: 20 } }
 *       - { name: pagina, in: query, schema: { type: integer, default: 1 } }
 *       - { name: id_mesa, in: query, schema: { type: integer } }
 *       - { name: id_usuario_empleado, in: query, schema: { type: integer } }
 *       - { name: estado, in: query, schema: { type: string }, description: "Filtrar por uno o más estados, separados por coma. Ej: Pendiente,En Preparación" }
 *       - { name: fechaDesde, in: query, schema: { type: string, format: date }, description: "Formato YYYY-MM-DD" }
 *       - { name: fechaHasta, in: query, schema: { type: string, format: date }, description: "Formato YYYY-MM-DD" }
 *       - { name: incluirEliminados, in: query, schema: { type: boolean, default: false } }
 *     responses:
 *       200:
 *         description: Lista de pedidos obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPedidos: { type: integer }
 *                 pedidos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pedido' # O un PedidoListaSchema más simple sin items
 *                 paginaActual: { type: integer }
 *                 totalPaginas: { type: integer }
 */
router.get('/', pedidoController.handleObtenerTodosLosPedidos);

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtiene un pedido por su ID con todos sus detalles (incluyendo menús pedidos)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: "Pedido obtenido", content: { application/json: { schema: { $ref: '#/components/schemas/Pedido' }}}}
 *       404: { description: "Pedido no encontrado" }
 */
router.get('/:id', pedidoController.handleObtenerPedidoPorId);

/**
 * @swagger
 * /api/pedidos/{id}/estado:
 *   patch:
 *     summary: Actualiza el estado de un pedido (ej. a 'En Preparación', 'Servido')
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: [En Preparación, Listo para Servir, Servido] }
 *     responses:
 *       200: { description: "Estado actualizado" }
 *       409: { description: "Transición de estado no válida (ej. pedido ya pagado)" }
 */
router.patch('/:id/estado', pedidoController.handleActualizarEstadoPedido);

/**
 * @swagger
 * /api/pedidos/{id}/cancelar:
 *   post:
 *     summary: Cancela un pedido, cambiando su estado a 'Cancelado'
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: "Pedido cancelado" }
 *       409: { description: "El pedido no se puede cancelar (ej. ya está pagado)" }
 */
router.post('/:id/cancelar', pedidoController.handleCancelarPedido);

/**
 * @swagger
 * /api/pedidos/{id}/pagar:
 *   post:
 *     summary: Registra el pago de un pedido y lo marca como 'Pagado'
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagoInput'
 *     responses:
 *       200: { description: "Pedido pagado exitosamente" }
 *       400: { description: "Monto insuficiente" }
 *       409: { description: "El pedido ya fue pagado" }
 */
router.post('/:id/pagar', pedidoController.handlePagarPedido);

// --- Rutas para gestionar los Menús (como items) dentro de un Pedido ---

/**
 * @swagger
 * /api/pedidos/{id}/menus:
 *   post:
 *     summary: Añade un menú (o incrementa su cantidad) a un pedido existente
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id, in: path, required: true, description: "ID del pedido al que se añade el menú", schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemPedidoInput' # Reutilizamos este schema, que espera id_menu y cantidad
 *     responses:
 *       200: { description: "Menú añadido o cantidad actualizada en el pedido" }
 *       404: { description: "Pedido o Menú no encontrado" }
 *       409: { description: "No se puede modificar un pedido pagado/cancelado" }
 */
router.post('/:id/menus', pedidoController.handleAnadirItemAPedido);

/**
 * @swagger
 * /api/pedidos/items/{id_item_pedido}:
 *   put:
 *     summary: Actualiza la cantidad o notas de un menú específico dentro de un pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id_item_pedido, in: path, required: true, description: "ID de la línea/item del pedido a actualizar", schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad: { type: integer, minimum: 0, description: "Nueva cantidad. Si es 0, el item se elimina." }
 *               notas_item: { type: string, nullable: true }
 *     responses:
 *       200: { description: "Item de pedido actualizado" }
 *       404: { description: "Item no encontrado" }
 */
router.put('/items/:id_item_pedido', pedidoController.handleActualizarItemDePedido);

/**
 * @swagger
 * /api/pedidos/items/{id_item_pedido}:
 *   delete:
 *     summary: Elimina (lógicamente) un menú (una línea) de un pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { name: id_item_pedido, in: path, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: "Item de pedido eliminado" }
 *       404: { description: "Item no encontrado" }
 */
router.delete('/items/:id_item_pedido', pedidoController.handleEliminarItemDePedido);

module.exports = router;
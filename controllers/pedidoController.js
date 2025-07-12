// controllers/pedidoController.js
const pedidoService = require('../services/pedidoService');

const pedidoController = {
  // --- Manejadores de Pedido Principal ---
  handleCrearPedido: async (req, res, next) => {
    try {
      console.log('handleCrearPedido - Datos recibidos:', req.body);
      const idUsuarioEmpleado = req.user.id;
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const nuevoPedido = await pedidoService.crearPedido(req.body, idUsuarioEmpleado, id_restaurante_contexto);
      res.status(201).json({ message: 'Pedido creado exitosamente.', data: nuevoPedido });
    } catch (error) { next(error); }
  },

  handleObtenerTodosLosPedidos: async (req, res, next) => {
    try {
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const resultado = await pedidoService.obtenerTodosLosPedidos(req.query, id_restaurante_contexto);
      res.status(200).json({ message: 'Pedidos obtenidos exitosamente.', data: resultado });
    } catch (error) { next(error); }
  },

  handleObtenerPedidoPorId: async (req, res, next) => {
    try {
      const idPedido = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const pedido = await pedidoService.obtenerPedidoPorId(idPedido, id_restaurante_contexto);
      if (!pedido) { const error = new Error('Pedido no encontrado.'); error.status = 404; throw error; }
      res.status(200).json({ message: 'Pedido obtenido exitosamente.', data: pedido });
    } catch (error) { next(error); }
  },

  handleActualizarEstadoPedido: async (req, res, next) => {
    try {
      const idPedido = parseInt(req.params.id, 10);
      const { estado } = req.body;
      const idRestauranteContexto = req.user.idRestaurante;
      if (!idRestauranteContexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      if (!estado) { const error = new Error('El campo "estado" es requerido.'); error.status = 400; throw error; }
      const pedidoActualizado = await pedidoService.actualizarEstadoPedido(idPedido, estado, idRestauranteContexto);
      res.status(200).json({ message: `Estado del pedido actualizado a "${estado}".`, data: pedidoActualizado });
    } catch (error) { next(error); }
  },

  handleCancelarPedido: async (req, res, next) => {
    try {
      const idPedido = parseInt(req.params.id, 10);
      const idRestauranteContexto = req.user.idRestaurante;
      if (!idRestauranteContexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const pedidoCancelado = await pedidoService.cancelarPedido(idPedido, idRestauranteContexto);
      res.status(200).json({ message: 'Pedido cancelado exitosamente.', data: pedidoCancelado });
    } catch (error) { next(error); }
  },

  handlePagarPedido: async (req, res, next) => {
    try {
      const idPedido = parseInt(req.params.id, 10);
      const idRestauranteContexto = req.user.idRestaurante;
      if (!idRestauranteContexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const resultadoPago = await pedidoService.pagarPedido(idPedido, req.body, idRestauranteContexto);
      res.status(200).json({ message: 'Pedido pagado exitosamente.', data: resultadoPago });
    } catch (error) { next(error); }
  },

  // --- Manejadores de Items de Pedido ---
  handleAnadirItemAPedido: async (req, res, next) => {
    try {
      const idPedido = parseInt(req.params.id, 10);
      const idRestauranteContexto = req.user.idRestaurante;
      if (!idRestauranteContexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const pedidoActualizado = await pedidoService.anadirMenuAPedido(idPedido, req.body, idRestauranteContexto);
      res.status(200).json({ message: 'Menú añadido/actualizado en el pedido exitosamente.', data: pedidoActualizado });
    } catch (error) { next(error); }
  },

  handleActualizarItemDePedido: async (req, res, next) => {
    try {
      const idItemPedido = parseInt(req.params.id_item_pedido, 10);
      const idRestauranteContexto = req.user.idRestaurante;
      if (!idRestauranteContexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const pedidoActualizado = await pedidoService.actualizarItemDePedido(idItemPedido, req.body, idRestauranteContexto);
      res.status(200).json({ message: 'Item de pedido actualizado exitosamente.', data: pedidoActualizado });
    } catch (error) { next(error); }
  },

  handleEliminarItemDePedido: async (req, res, next) => {
    try {
      const idItemPedido = parseInt(req.params.id_item_pedido, 10);
      const idRestauranteContexto = req.user.idRestaurante;
      if (!idRestauranteContexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const pedidoActualizado = await pedidoService.eliminarItemDePedido(idItemPedido, idRestauranteContexto);
      res.status(200).json({ message: 'Item de pedido eliminado exitosamente.', data: pedidoActualizado });
    } catch (error) { next(error); }
  },
};
module.exports = pedidoController;
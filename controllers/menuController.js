// controllers/menuController.js
const menuService = require('../services/menuService');

const menuController = {
  // --- Controladores para la entidad Menú ---
  async handleCrearMenu(req, res, next) {
    try {
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const nuevoMenu = await menuService.crearMenu(req.body, id_restaurante_contexto);
      res.status(201).json({ message: 'Menú creado exitosamente.', data: nuevoMenu });
    } catch (error) { next(error); }
  },

  async handleObtenerTodosLosMenus(req, res, next) {
    try {
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const resultado = await menuService.obtenerTodosLosMenus(req.query, id_restaurante_contexto);
      res.status(200).json({ message: 'Menús obtenidos exitosamente.', data: resultado });
    } catch (error) { next(error); }
  },

  async handleObtenerMenuPorId(req, res, next) {
    try {
      const idMenu = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const incluirEliminados = req.query.incluirEliminados === 'true';
      const menu = await menuService.obtenerMenuPorId(idMenu, id_restaurante_contexto, incluirEliminados);
      if (!menu) { const error = new Error('Menú no encontrado.'); error.status = 404; throw error; }
      res.status(200).json({ message: 'Menú obtenido exitosamente.', data: menu });
    } catch (error) { next(error); }
  },

  async handleActualizarMenu(req, res, next) {
    try {
      const idMenu = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const menuActualizado = await menuService.actualizarMenu(idMenu, req.body, id_restaurante_contexto);
      res.status(200).json({ message: 'Datos del menú actualizados exitosamente.', data: menuActualizado });
    } catch (error) { next(error); }
  },

  async handleEliminarMenu(req, res, next) {
    try {
      const idMenu = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      await menuService.eliminarMenu(idMenu, id_restaurante_contexto);
      res.status(200).json({ message: 'Menú eliminado (lógicamente) exitosamente.' });
    } catch (error) { next(error); }
  },

  async handleRestaurarMenu(req, res, next) {
    try {
      const idMenu = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }
      const menuRestaurado = await menuService.restaurarMenu(idMenu, id_restaurante_contexto);
      res.status(200).json({ message: 'Menú restaurado exitosamente.', data: menuRestaurado });
    } catch (error) { next(error); }
  },

  // --- Controladores para los Items ---
  async handleAnadirItemAMenu(req, res, next) {
    try {
      const idMenu = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }

      const nuevoItem = await menuService.anadirItemAMenu(idMenu, req.body, id_restaurante_contexto);
      res.status(201).json({ message: "Item añadido al menú exitosamente.", data: nuevoItem });
    } catch (error) {
      next(error);
    }
  },

  async handleActualizarItemDeMenu(req, res, next) {
    try {
      const idItemMenu = parseInt(req.params.id_item, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }

      const itemActualizado = await menuService.actualizarItemDeMenu(idItemMenu, req.body, id_restaurante_contexto);
      res.status(200).json({ message: "Item de menú actualizado exitosamente.", data: itemActualizado });
    } catch (error) {
      next(error);
    }
  },

  async handleEliminarItemDeMenu(req, res, next) {
    try {
      const idItemMenu = parseInt(req.params.id_item, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) { const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error; }

      await menuService.eliminarItemDeMenu(idItemMenu, id_restaurante_contexto);
      res.status(200).json({ message: "Item eliminado del menú exitosamente." });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = menuController;
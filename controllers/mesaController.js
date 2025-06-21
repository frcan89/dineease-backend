// controllers/mesaController.js
const mesaService = require('../services/mesaService');

const mesaController = {
  async handleCrearMesa(req, res, next) {
    try {
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      const nuevaMesa = await mesaService.crearMesa(req.body, id_restaurante_contexto);
      res.status(201).json({ message: 'Mesa creada exitosamente.', data: nuevaMesa });
    } catch (error) { next(error); }
  },

  async handleObtenerTodasLasMesas(req, res, next) {
    try {
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      const resultado = await mesaService.obtenerTodasLasMesas(req.query, id_restaurante_contexto);
      res.status(200).json({ message: 'Mesas obtenidas exitosamente.', data: resultado });
    } catch (error) { next(error); }
  },

  async handleObtenerMesaPorId(req, res, next) {
    try {
      const idMesa = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      const incluirEliminados = req.query.incluirEliminados === 'true';
      const mesa = await mesaService.obtenerMesaPorId(idMesa, id_restaurante_contexto, incluirEliminados);
      if (!mesa) { const error = new Error('Mesa no encontrada.'); error.status = 404; throw error; }
      res.status(200).json({ message: 'Mesa obtenida exitosamente.', data: mesa });
    } catch (error) { next(error); }
  },

  async handleActualizarMesa(req, res, next) {
    try {
      const idMesa = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      const mesaActualizada = await mesaService.actualizarMesa(idMesa, req.body, id_restaurante_contexto);
      res.status(200).json({ message: 'Mesa actualizada exitosamente.', data: mesaActualizada });
    } catch (error) { next(error); }
  },

  async handleEliminarMesa(req, res, next) {
    try {
      const idMesa = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      await mesaService.eliminarMesa(idMesa, id_restaurante_contexto);
      res.status(200).json({ message: 'Mesa eliminada (lógicamente) exitosamente.' });
    } catch (error) { next(error); }
  },

  async handleRestaurarMesa(req, res, next) {
    try {
      const idMesa = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      const mesaRestaurada = await mesaService.restaurarMesa(idMesa, id_restaurante_contexto);
      res.status(200).json({ message: 'Mesa restaurada exitosamente.', data: mesaRestaurada });
    } catch (error) { next(error); }
  }
};
module.exports = mesaController;
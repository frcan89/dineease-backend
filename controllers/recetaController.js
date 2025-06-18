// controllers/recetaController.js
const recetaService = require('../services/recetaService');

const recetaController = {
  async handleCrearReceta(req, res, next) {
    try {
      const idUsuarioLogueado = req.user.id;
      const id_restaurante_contexto = req.user.idRestaurante;
      
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      // req.body debería contener: { nombre, descripcion, ..., ingredientes: [{id_producto, cantidad, unidad_medida_receta}, ...]}
      const nuevaReceta = await recetaService.crearReceta(req.body, idUsuarioLogueado, id_restaurante_contexto);
      res.status(201).json({ message: 'Receta creada exitosamente.', data: nuevaReceta });
    } catch (error) { next(error); }
  },

  async handleObtenerTodasLasRecetas(req, res, next) {
    try {
      const id_restaurante_contexto = req.user.idRestaurante;
      console.log('Query Params:', req);
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      const resultado = await recetaService.obtenerTodasLasRecetas(req.query, id_restaurante_contexto);
      res.status(200).json({ message: 'Recetas obtenidas exitosamente.', data: resultado });
    } catch (error) { next(error); }
  },

  async handleObtenerRecetaPorId(req, res, next) {
    try {
      const idReceta = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      const incluirEliminados = req.query.incluirEliminados === 'true';
      const receta = await recetaService.obtenerRecetaPorId(idReceta, id_restaurante_contexto, incluirEliminados);
      if (!receta) { const error = new Error('Receta no encontrada.'); error.status = 404; throw error; }
      res.status(200).json({ message: 'Receta obtenida exitosamente.', data: receta });
    } catch (error) { next(error); }
  },

  async handleActualizarReceta(req, res, next) {
    try {
      const idReceta = parseInt(req.params.id, 10);
      const idUsuarioLogueado = req.user.id;
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      const recetaActualizada = await recetaService.actualizarReceta(idReceta, req.body, idUsuarioLogueado, id_restaurante_contexto);
      res.status(200).json({ message: 'Receta actualizada exitosamente.', data: recetaActualizada });
    } catch (error) { next(error); }
  },

  async handleEliminarReceta(req, res, next) {
    try {
      const idReceta = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      await recetaService.eliminarReceta(idReceta, id_restaurante_contexto);
      res.status(200).json({ message: 'Receta eliminada (lógicamente) exitosamente.' });
    } catch (error) { next(error); }
  },

  async handleRestaurarReceta(req, res, next) {
    try {
      const idReceta = parseInt(req.params.id, 10);
      const id_restaurante_contexto = req.user.idRestaurante;
      if (!id_restaurante_contexto) {
        const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
      }
      const recetaRestaurada = await recetaService.restaurarReceta(idReceta, id_restaurante_contexto);
      res.status(200).json({ message: 'Receta restaurada exitosamente.', data: recetaRestaurada });
    } catch (error) { next(error); }
  }
};
module.exports = recetaController;
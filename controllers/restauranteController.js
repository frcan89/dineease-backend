const restauranteService = require('../services/restauranteService'); // Ajusta la ruta

const restauranteController = {
  /**
   * POST /api/restaurantes
   */
  async handleCrearRestaurante(req, res, next) {
    try {
      const datosRestaurante = req.body;
      // Aquí puedes añadir validación de datos más exhaustiva (Joi, express-validator)
      if (!datosRestaurante.nombre) {
        const error = new Error('El nombre del restaurante es obligatorio.');
        error.status = 400;
        throw error;
      }
      const nuevoRestaurante = await restauranteService.crearRestaurante(datosRestaurante);
      res.status(201).json({
        message: 'Restaurante creado exitosamente.',
        data: nuevoRestaurante,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/restaurantes?limite=X&pagina=Y&nombre=Z
   */
  async handleObtenerTodosLosRestaurantes(req, res, next) {
    try {
      const { limite, pagina, nombre } = req.query;
      const filtros = {
        limite: limite ? parseInt(limite, 10) : undefined,
        pagina: pagina ? parseInt(pagina, 10) : undefined,
        nombre: nombre || undefined,
      };
      const resultado = await restauranteService.obtenerTodosLosRestaurantes(filtros);
      res.status(200).json({
        message: 'Restaurantes obtenidos exitosamente.',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/restaurantes/:id
   */
  async handleObtenerRestaurantePorId(req, res, next) {
    try {
      const idRestaurante = parseInt(req.params.id, 10);
      if (isNaN(idRestaurante)) {
        const error = new Error('ID de restaurante inválido.');
        error.status = 400;
        throw error;
      }
      const restaurante = await restauranteService.obtenerRestaurantePorId(idRestaurante);
      if (!restaurante) {
        const error = new Error('Restaurante no encontrado.');
        error.status = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Restaurante obtenido exitosamente.',
        data: restaurante,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/restaurantes/:id
   */
  async handleActualizarRestaurante(req, res, next) {
    try {
      const idRestaurante = parseInt(req.params.id, 10);
      if (isNaN(idRestaurante)) {
        const error = new Error('ID de restaurante inválido.');
        error.status = 400;
        throw error;
      }
      const datosActualizacion = req.body;
      if (Object.keys(datosActualizacion).length === 0) {
        const error = new Error('No se proporcionaron datos para actualizar.');
        error.status = 400;
        throw error;
      }

      const restauranteActualizado = await restauranteService.actualizarRestaurante(idRestaurante, datosActualizacion);
      res.status(200).json({
        message: 'Restaurante actualizado exitosamente.',
        data: restauranteActualizado,
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * PUT /api/restaurantes/:id/restaurar
   */
  async handleRestaurarRestaurante(req, res, next) {
    try {
      const idRestaurante = parseInt(req.params.id, 10);
      if (isNaN(idRestaurante)) {
        const error = new Error('ID de restaurante inválido.');
        error.status = 400;
        throw error;
      }

      const restauranteRestaurado = await restauranteService.restaurarRestaurante(idRestaurante);

      if (!restauranteRestaurado && res.statusCode !== 409) { // Si no es un error de conflicto ya manejado
        const error = new Error('Restaurante no encontrado o no se pudo restaurar (quizás ya estaba activo).');
        error.status = 404; // O 400
        throw error;
      }

      res.status(200).json({
        message: 'Restaurante restaurado (marcado como activo) exitosamente.',
        data: restauranteRestaurado, // Devuelve el restaurante restaurado
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/restaurantes/:id
   */
  async handleEliminarRestaurante(req, res, next) {
    try {
      const idRestaurante = parseInt(req.params.id, 10);
      if (isNaN(idRestaurante)) {
        const error = new Error('ID de restaurante inválido.');
        error.status = 400;
        throw error;
      }
      const resultado = await restauranteService.eliminarRestaurante(idRestaurante);
      if (!resultado) { // Si el servicio devuelve false porque no se encontró
        const error = new Error('Restaurante no encontrado para eliminar.');
        error.status = 404;
        throw error;
      }
      res.status(200).json({ message: 'Restaurante eliminado exitosamente.' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = restauranteController;
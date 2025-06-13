const productoService = require('../services/productoService');

const productoController = {
  async handleCrearProducto(req, res, next) {
    try {
      const datosProducto = req.body;
      // Basic validation (more comprehensive validation can be added with Joi or express-validator)
      if (!datosProducto.nombre || !datosProducto.unidad_medida || !datosProducto.idRestaurante) {
        const error = new Error('Nombre, unidad de medida e ID del restaurante son obligatorios.');
        error.status = 400;
        throw error;
      }
      const nuevoProducto = await productoService.crearProducto(datosProducto);
      res.status(201).json({
        message: 'Producto creado exitosamente.',
        data: nuevoProducto,
      });
    } catch (error) {
      next(error);
    }
  },

  async handleObtenerTodosLosProductos(req, res, next) {
    try {
      const { limite, pagina, nombre, idRestaurante, incluirEliminados } = req.query;
      const filtros = {
        limite: limite ? parseInt(limite, 10) : undefined,
        pagina: pagina ? parseInt(pagina, 10) : undefined,
        nombre: nombre || undefined,
        idRestaurante: idRestaurante ? parseInt(idRestaurante, 10) : undefined,
        incluirEliminados: incluirEliminados === 'true',
      };
      // Ensure idRestaurante is provided if not admin or specific cross-restaurant role
      // This logic might be more complex depending on roles and permissions
      if (!filtros.idRestaurante) {
        // Assuming a general user needs to specify their restaurant context
        // For an admin, this check might be skipped or handled differently in the service
        // const error = new Error('El parámetro idRestaurante es obligatorio para listar productos.');
        // error.status = 400;
        // throw error;
      }
      const resultado = await productoService.obtenerTodosLosProductos(filtros);
      res.status(200).json({
        message: 'Productos obtenidos exitosamente.',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  },

  async handleObtenerProductoPorId(req, res, next) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      if (isNaN(idProducto)) {
        const error = new Error('ID de producto inválido.');
        error.status = 400;
        throw error;
      }
      const { incluirEliminados } = req.query;
      const producto = await productoService.obtenerProductoPorId(idProducto, incluirEliminados === 'true');
      if (!producto) {
        const error = new Error('Producto no encontrado.');
        error.status = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Producto obtenido exitosamente.',
        data: producto,
      });
    } catch (error) {
      next(error);
    }
  },

  async handleActualizarProducto(req, res, next) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      if (isNaN(idProducto)) {
        const error = new Error('ID de producto inválido.');
        error.status = 400;
        throw error;
      }
      const datosActualizacion = req.body;
      if (Object.keys(datosActualizacion).length === 0) {
        const error = new Error('No se proporcionaron datos para actualizar.');
        error.status = 400;
        throw error;
      }

      const productoActualizado = await productoService.actualizarProducto(idProducto, datosActualizacion);
      res.status(200).json({
        message: 'Producto actualizado exitosamente.',
        data: productoActualizado,
      });
    } catch (error) {
      next(error);
    }
  },

  async handleRestaurarProducto(req, res, next) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      if (isNaN(idProducto)) {
        const error = new Error('ID de producto inválido.');
        error.status = 400;
        throw error;
      }
      const productoRestaurado = await productoService.restaurarProducto(idProducto);
      res.status(200).json({
        message: 'Producto restaurado exitosamente.',
        data: productoRestaurado,
      });
    } catch (error) {
      next(error);
    }
  },

  async handleEliminarProducto(req, res, next) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      if (isNaN(idProducto)) {
        const error = new Error('ID de producto inválido.');
        error.status = 400;
        throw error;
      }
      await productoService.eliminarProducto(idProducto);
      res.status(200).json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = productoController;

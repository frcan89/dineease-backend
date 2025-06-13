const inventarioService = require('../services/inventarioService');

const inventarioController = {
  async handleCrearInventario(req, res, next) {
    try {
      // Validación básica de entrada
      const { idProducto, cantidad } = req.body;
      if (!idProducto || cantidad === undefined) {
        return res.status(400).json({ message: 'Los campos idProducto y cantidad son obligatorios.' });
      }
      if (isNaN(parseInt(idProducto, 10))) {
        return res.status(400).json({ message: 'El idProducto debe ser un número.' });
      }
      if (isNaN(parseInt(cantidad, 10))) {
        return res.status(400).json({ message: 'La cantidad debe ser un número.' });
      }

      const nuevoInventario = await inventarioService.crearInventario(req.body);
      res.status(201).json(nuevoInventario);
    } catch (error) {
      if (error.message.includes('obligatorio') || error.message.includes('no existe') || error.message.includes('Ya existe un inventario')) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  },

  async handleObtenerTodosLosInventarios(req, res, next) {
    try {
      const { limite, pagina, idProducto } = req.query;
      // Validación opcional para los query params si es necesario
      if (limite && isNaN(parseInt(limite, 10))) {
        return res.status(400).json({ message: 'El parámetro limite debe ser un número.' });
      }
      if (pagina && isNaN(parseInt(pagina, 10))) {
        return res.status(400).json({ message: 'El parámetro pagina debe ser un número.' });
      }
      if (idProducto && isNaN(parseInt(idProducto, 10))) {
        return res.status(400).json({ message: 'El parámetro idProducto debe ser un número.' });
      }

      const inventarios = await inventarioService.obtenerTodosLosInventarios(req.query);
      res.status(200).json(inventarios);
    } catch (error) {
      next(error);
    }
  },

  async handleObtenerInventarioPorId(req, res, next) {
    try {
      const { idInventario } = req.params;
      if (isNaN(parseInt(idInventario, 10))) {
        return res.status(400).json({ message: 'El idInventario debe ser un número.' });
      }
      const inventario = await inventarioService.obtenerInventarioPorId(parseInt(idInventario, 10));
      res.status(200).json(inventario);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },

  async handleObtenerInventarioPorIdProducto(req, res, next) {
    try {
      const { idProducto } = req.params;
      if (isNaN(parseInt(idProducto, 10))) {
        return res.status(400).json({ message: 'El idProducto debe ser un número.' });
      }
      const inventario = await inventarioService.obtenerInventarioPorIdProducto(parseInt(idProducto, 10));
      res.status(200).json(inventario);
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('obligatorio')) {
        // 'obligatorio' can be from service if idProducto is not passed (though route ensures it)
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },

  async handleActualizarInventario(req, res, next) {
    try {
      const { idInventario } = req.params;
      const datosActualizacion = req.body;

      if (isNaN(parseInt(idInventario, 10))) {
        return res.status(400).json({ message: 'El idInventario debe ser un número.' });
      }
      // Validación adicional para datosActualizacion si es necesario
      if (datosActualizacion.idProducto && isNaN(parseInt(datosActualizacion.idProducto, 10))) {
        return res.status(400).json({ message: 'El idProducto en el cuerpo de la solicitud debe ser un número.' });
      }
      if (datosActualizacion.cantidad && isNaN(parseInt(datosActualizacion.cantidad, 10))) {
        return res.status(400).json({ message: 'La cantidad en el cuerpo de la solicitud debe ser un número.' });
      }


      const inventarioActualizado = await inventarioService.actualizarInventario(parseInt(idInventario, 10), datosActualizacion);
      res.status(200).json(inventarioActualizado);
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('no existe') || error.message.includes('Ya existe un inventario')) {
        return res.status(404).json({ message: error.message }); // 404 o 400 dependiendo del error
      }
      next(error);
    }
  },

  async handleEliminarInventario(req, res, next) {
    try {
      const { idInventario } = req.params;
      if (isNaN(parseInt(idInventario, 10))) {
        return res.status(400).json({ message: 'El idInventario debe ser un número.' });
      }
      const resultado = await inventarioService.eliminarInventario(parseInt(idInventario, 10));
      res.status(200).json(resultado); // O res.status(204).send(); si no hay contenido que devolver
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },
};

module.exports = inventarioController;

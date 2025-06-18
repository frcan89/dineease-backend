// controllers/productoController.js
const productoService = require('../services/productoService');

const productoController = {
  async handleCrearProducto(req, res, next) {
    try {
      // El id_restaurante debería venir del contexto del usuario autenticado o ser un parámetro explícito
      // Asumimos que el usuario tiene un id_restaurante en req.user o se pasa en el body
      const idUsuarioLogueado = req.user.id; // Del middleware de autenticación
      let idRestauranteDelProducto = req.body.id_restaurante;

      // Si el usuario no es superadmin, forzar el id_restaurante del token
      // Aquí necesitarías una lógica para determinar si el req.user es superadmin
      // if (!esSuperAdmin(req.user.id_rol)) {
      //    idRestauranteDelProducto = req.user.id_restaurante;
      //    if (!idRestauranteDelProducto) {
      //        const error = new Error('Usuario no asociado a un restaurante.');
      //        error.status = 403; throw error;
      //    }
      // } else if (!idRestauranteDelProducto) { // Superadmin debe especificar el restaurante
      //    const error = new Error('Superadmin debe especificar el id_restaurante para el producto.');
      //    error.status = 400; throw error;
      // }
      // Simplificación por ahora:
      if (!idRestauranteDelProducto && req.user.id_restaurante) {
        idRestauranteDelProducto = req.user.id_restaurante;
      } else if (!idRestauranteDelProducto) {
        const error = new Error('Se requiere id_restaurante.'); error.status = 400; throw error;
      }


      const datosProducto = { ...req.body, id_restaurante: idRestauranteDelProducto };
      const nuevoProducto = await productoService.crearProducto(datosProducto, idUsuarioLogueado);
      res.status(201).json({ message: 'Producto creado exitosamente.', data: nuevoProducto });
    } catch (error) { next(error); }
  },

  async handleObtenerTodosLosProductos(req, res, next) {
    try {
      // Forzar filtro por el id_restaurante del usuario si no es superadmin
      let idRestauranteFiltro = req.query.id_restaurante;
      // if (!esSuperAdmin(req.user.id_rol)) {
      //    idRestauranteFiltro = req.user.id_restaurante;
      // } else if (!idRestauranteFiltro) {
      //    // Superadmin podría ver todos si no especifica, o podríamos forzarlo
      // }
      // Simplificación:
      if (!idRestauranteFiltro && req.user.id_restaurante) {
        idRestauranteFiltro = req.user.id_restaurante;
      }

      const filtros = { ...req.query, id_restaurante: idRestauranteFiltro };
      const resultado = await productoService.obtenerTodosLosProductos(filtros);
      res.status(200).json({ message: 'Productos obtenidos exitosamente.', data: resultado });
    } catch (error) { next(error); }
  },

  async handleObtenerProductoPorId(req, res, next) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      // El servicio ya puede filtrar por id_restaurante del contexto
      const idRestauranteContexto = req.user.id_restaurante; // Asumiendo que el usuario normal tiene esto
      // Si es superadmin, idRestauranteContexto podría ser undefined para que el servicio no filtre por él
      // let idRestauranteDelUsuario = req.user.id_restaurante;
      // if (esSuperAdmin(req.user.id_rol) && !req.query.id_restaurante_explicito) {
      //   idRestauranteDelUsuario = undefined; // Superadmin puede ver cualquier producto por ID si no se filtra explícitamente
      // }


      const producto = await productoService.obtenerProductoPorId(idProducto, idRestauranteContexto, req.query.incluirEliminados === 'true');
      if (!producto) { const error = new Error('Producto no encontrado.'); error.status = 404; throw error; }
      res.status(200).json({ message: 'Producto obtenido exitosamente.', data: producto });
    } catch (error) { next(error); }
  },

  async handleActualizarProducto(req, res, next) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      const idUsuarioLogueado = req.user.id;
      const idRestauranteContexto = req.user.id_restaurante; // Un usuario solo puede actualizar productos de su restaurante
       if (!idRestauranteContexto /* && !esSuperAdmin(req.user.id_rol) */) { // Superadmin necesitaría pasar id_restaurante_contexto en body o query
            const error = new Error('Operación no permitida o restaurante no especificado.');
            error.status = 403; throw error;
       }

      const productoActualizado = await productoService.actualizarProducto(idProducto, req.body, idUsuarioLogueado, idRestauranteContexto);
      res.status(200).json({ message: 'Producto actualizado exitosamente.', data: productoActualizado });
    } catch (error) { next(error); }
  },

  async handleEliminarProducto(req, res, next) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      const idRestauranteContexto = req.user.id_restaurante;
      if (!idRestauranteContexto /* && !esSuperAdmin(req.user.id_rol) */) {
            const error = new Error('Operación no permitida.');
            error.status = 403; throw error;
       }
      await productoService.eliminarProducto(idProducto, idRestauranteContexto);
      res.status(200).json({ message: 'Producto eliminado (lógicamente) exitosamente.' });
    } catch (error) { next(error); }
  },

  async handleRestaurarProducto(req, res, next) {
    try {
      const idProducto = parseInt(req.params.id, 10);
      const idRestauranteContexto = req.user.id_restaurante;
       if (!idRestauranteContexto /* && !esSuperAdmin(req.user.id_rol) */) {
            const error = new Error('Operación no permitida.');
            error.status = 403; throw error;
       }
      const productoRestaurado = await productoService.restaurarProducto(idProducto, idRestauranteContexto);
      res.status(200).json({ message: 'Producto restaurado exitosamente.', data: productoRestaurado });
    } catch (error) { next(error); }
  }
};
module.exports = productoController;
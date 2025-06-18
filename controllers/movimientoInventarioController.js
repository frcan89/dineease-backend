// controllers/movimientoInventarioController.js
const inventarioService = require('../services/inventarioService');

const movimientoInventarioController = {
  async handleRegistrarMovimiento(req, res, next) {
    try {
      const datosMovimiento = req.body;
      const idUsuarioResponsable = req.user.id; // Del middleware de autenticación
      const idRestauranteContexto = req.user.id_restaurante;

      if (!idRestauranteContexto) { // Asumiendo que un usuario no superadmin siempre tiene restaurante
          const error = new Error('Usuario no asociado a un restaurante para realizar movimientos de inventario.');
          error.status = 403;
          throw error;
      }
      // Validación básica de entrada
      if (!datosMovimiento.id_producto || !datosMovimiento.tipo_movimiento || datosMovimiento.cantidad_movida === undefined) {
          const error = new Error('Faltan campos obligatorios: id_producto, tipo_movimiento, cantidad_movida.');
          error.status = 400;
          throw error;
      }
      if (isNaN(parseInt(datosMovimiento.cantidad_movida)) || parseInt(datosMovimiento.cantidad_movida) <= 0) {
          const error = new Error('cantidad_movida debe ser un número positivo.');
          error.status = 400;
          throw error;
      }
      // Validar precio_compra_unitario_movimiento si es ENTRADA_COMPRA
      if (datosMovimiento.tipo_movimiento === 'ENTRADA_COMPRA' && datosMovimiento.precio_compra_unitario_movimiento !== undefined) {
          if (isNaN(parseFloat(datosMovimiento.precio_compra_unitario_movimiento)) || parseFloat(datosMovimiento.precio_compra_unitario_movimiento) < 0) {
              const error = new Error('precio_compra_unitario_movimiento debe ser un número no negativo para ENTRADA_COMPRA.');
              error.status = 400;
              throw error;
          }
      }


      const resultado = await inventarioService.registrarMovimiento(
        datosMovimiento,
        idUsuarioResponsable,
        idRestauranteContexto
      );

      res.status(201).json({ // 201 para creación de movimiento, 200 si se ve más como actualización
        message: `Movimiento de inventario tipo '${datosMovimiento.tipo_movimiento}' registrado exitosamente.`,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  },

  async handleObtenerMovimientosDeProducto(req, res, next) {
    try {
        const idProducto = parseInt(req.params.id_producto, 10);
        const idRestauranteContexto = req.user.idRestaurante;
        console.log(idProducto, idRestauranteContexto);

        if (isNaN(idProducto)) {
            const error = new Error("ID de producto inválido."); error.status = 400; throw error;
        }
        if (!idRestauranteContexto) {
            const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
        }

        const resultado = await inventarioService.obtenerMovimientosDeProducto(idProducto, req.query, idRestauranteContexto);
        res.status(200).json({
            message: `Movimientos de inventario para el producto ID ${idProducto} obtenidos.`,
            data: resultado
        });
    } catch (error) {
        next(error);
    }
  },

  async handleObtenerStockActual(req, res, next) {
    try {
        const idProducto = parseInt(req.params.id_producto, 10);
        const idRestauranteContexto = req.user.id_restaurante;
        console.log(`ID Producto: ${idProducto}, ID Restaurante Contexto: ${idRestauranteContexto}`);
        if (isNaN(idProducto)) {
            const error = new Error("ID de producto inválido."); error.status = 400; throw error;
        }
        if (!idRestauranteContexto) {
            const error = new Error('Usuario no asociado a un restaurante.'); error.status = 403; throw error;
        }
        const stock = await inventarioService.obtenerStockActual(idProducto, idRestauranteContexto);
        res.status(200).json({
            message: `Stock actual para el producto ID ${idProducto}.`,
            data: stock
        });
    } catch (error) {
        next(error);
    }
  }
};

module.exports = movimientoInventarioController;
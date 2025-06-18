// services/inventarioService.js
const db = require('../models');
const { Op } = require('sequelize');

const inventarioService = {
  /**
   * Registra un movimiento de inventario y actualiza el stock del producto.
   * Si es una ENTRADA_COMPRA y se provee precio_compra_unitario_movimiento,
   * actualiza el precio_compra en la tabla Producto.
   */
  async registrarMovimiento(datosMovimiento, idUsuarioResponsable, id_restaurante_contexto) {
    const {
      id_producto,
      tipo_movimiento,
      cantidad_movida,
      motivo,
      precio_compra_unitario_movimiento // Nuevo campo para el precio de esta entrada
    } = datosMovimiento;

    if (!id_producto || !tipo_movimiento || cantidad_movida === undefined || cantidad_movida <= 0) {
      const error = new Error('ID de producto, tipo de movimiento y cantidad positiva son requeridos.');
      error.status = 400;
      throw error;
    }

    const t = await db.sequelize.transaction();
    try {
      // 1. Validar producto y su pertenencia al restaurante
      const producto = await db.Producto.findOne({
        where: { id_producto, id_restaurante: id_restaurante_contexto },
        transaction: t,
        // paranoid: true (para asegurar que operamos sobre un producto activo)
      });

      if (!producto) {
        const error = new Error('Producto no encontrado en este restaurante o está eliminado.');
        error.status = 404;
        throw error;
      }

      // 2. Obtener o crear/restaurar inventario
      let inventario = await db.Inventario.findOne({
        where: { id_producto },
        transaction: t,
        paranoid: false // Buscar incluso si está eliminado para poder restaurarlo
      });

      if (!inventario) {
        inventario = await db.Inventario.create({
          id_producto,
          cantidad: 0,
          eliminado: false,
          fecha_eliminacion: null
        }, { transaction: t });
      } else if (inventario.eliminado || inventario.fecha_eliminacion) {
        await inventario.restore({ transaction: t }); // Llama al hook para eliminado=false
        await inventario.update({ cantidad: 0 }, { transaction: t }); // Resetear cantidad
      }

      const cantidadAnterior = inventario.cantidad;
      let cantidadNueva;

      // 3. Determinar el efecto del movimiento en la cantidad
      const esEntrada = tipo_movimiento.startsWith('ENTRADA');
      const esSalida = tipo_movimiento.startsWith('SALIDA');

      if (esEntrada) {
        cantidadNueva = cantidadAnterior + cantidad_movida;
      } else if (esSalida) {
        cantidadNueva = cantidadAnterior - cantidad_movida;
        if (cantidadNueva < 0) {
          // Considerar si se permite stock negativo o se lanza error.
          // Por ahora, lo permitimos pero podría ser un punto de configuración/error.
          console.warn(`Alerta: Stock negativo para producto ID ${id_producto}. Stock anterior: ${cantidadAnterior}, Salida: ${cantidad_movida}`);
        }
      } else {
        await t.rollback(); // Tipo de movimiento no reconocido
        const error = new Error('Tipo de movimiento no válido.');
        error.status = 400;
        throw error;
      }

      // 4. Actualizar inventario
      await inventario.update({ cantidad: cantidadNueva }, { transaction: t });

      // 5. Si es ENTRADA_COMPRA y se provee precio, actualizar precio_compra del producto
      if (tipo_movimiento === 'ENTRADA_COMPRA' && precio_compra_unitario_movimiento !== undefined && precio_compra_unitario_movimiento !== null) {
        if (parseFloat(precio_compra_unitario_movimiento) >= 0) {
          await producto.update({
            precio_compra: parseFloat(precio_compra_unitario_movimiento),
            id_usuario_registro: idUsuarioResponsable // Quién actualizó el precio
          }, { transaction: t });
        } else {
          console.warn(`Precio de compra unitario inválido (${precio_compra_unitario_movimiento}) para producto ID ${id_producto}. No se actualizó el precio del producto.`);
        }
      }

      // 6. Crear el registro del movimiento
      const movimientoRegistrado = await db.MovimientoInventario.create({
        id_producto,
        id_usuario_responsable: idUsuarioResponsable,
        tipo_movimiento,
        cantidad_movida,
        cantidad_anterior: cantidadAnterior,
        cantidad_nueva: cantidadNueva,
        precio_compra_unitario_movimiento: (tipo_movimiento === 'ENTRADA_COMPRA' && precio_compra_unitario_movimiento !== undefined)
                                            ? parseFloat(precio_compra_unitario_movimiento)
                                            : null,
        motivo,
      }, { transaction: t });

      await t.commit();
      return {
        movimiento: movimientoRegistrado,
        inventarioActualizado: inventario, // o solo inventario.cantidad
        productoActualizado: (tipo_movimiento === 'ENTRADA_COMPRA' && precio_compra_unitario_movimiento !== undefined) ? producto : null
      };

    } catch (error) {
      await t.rollback();
      console.error('Error al registrar movimiento de inventario:', error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerMovimientosDeProducto(idProducto, filtros = {}, id_restaurante_contexto) {
    // Primero verificar que el producto pertenece al restaurante
     const producto = await db.Producto.findOne({
        where: { id_producto: idProducto, id_restaurante: id_restaurante_contexto },
      });
      if (!producto) {
        const error = new Error('Producto no encontrado en este restaurante.');
        error.status = 404;
        throw error;
      }

    const { limite = 20, pagina = 1, tipo_movimiento, fechaDesde, fechaHasta } = filtros;
    const offset = (pagina - 1) * limite;
    const whereClause = { id_producto: idProducto};

    if (tipo_movimiento) whereClause.tipo_movimiento = tipo_movimiento;
    if (fechaDesde) whereClause.fecha_movimiento = { ...whereClause.fecha_movimiento, [Op.gte]: new Date(fechaDesde) };
    if (fechaHasta) {
        let hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999); // Incluir todo el día hasta
        whereClause.fecha_movimiento = { ...whereClause.fecha_movimiento, [Op.lte]: hasta };
    }


    const { count, rows } = await db.MovimientoInventario.findAndCountAll({
      where: whereClause,
      include: [
        { model: db.Usuario, as: 'usuarioResponsable', attributes: ['id_usuario', 'nombre'] }
      ],
      limit: parseInt(limite, 10),
      offset: parseInt(offset, 10),
      order: [['fecha_movimiento', 'DESC'], ['id_movimiento', 'DESC']],
    });

    return {
      totalMovimientos: count,
      movimientos: rows,
      paginaActual: parseInt(pagina, 10),
      totalPaginas: Math.ceil(count / limite),
    };
  },

  async obtenerStockActual(idProducto, id_restaurante_contexto) {
     const producto = await db.Producto.findOne({
        where: { id_producto, id_restaurante: id_restaurante_contexto },
      });
      if (!producto) {
        const error = new Error('Producto no encontrado en este restaurante.');
        error.status = 404;
        throw error;
      }

    const inventario = await db.Inventario.findOne({
        where: { id_producto },
        attributes: ['cantidad', 'fecha_actualizacion']
        // paranoid: true (si quieres solo de inventarios activos)
    });
    return inventario || { cantidad: 0, fecha_actualizacion: null, mensaje: "Producto sin registro de inventario, asumiendo 0." };
  }

};

module.exports = inventarioService;
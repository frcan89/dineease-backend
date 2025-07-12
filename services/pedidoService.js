// services/pedidoService.js
const db = require('../models');
const { Op } = require('sequelize');

// --- Función Helper para Recalcular Subtotal ---
async function recalcularSubtotal(idPedido, transaction) {
  const items = await db.ItemPedido.findAll({
    where: { id_pedido: idPedido },
    transaction,
    paranoid: true, // No contar items eliminados lógicamente
  });
  const subtotal = items.reduce((sum, item) => sum + (parseInt(item.cantidad, 10) * parseFloat(item.precio_unitario_momento)), 0);
  await db.Pedido.update({ subtotal: subtotal.toFixed(2) }, { where: { id_pedido: idPedido }, transaction });
  return subtotal;
}

const pedidoService = {
  // --- Funciones para el Pedido principal ---

  async crearPedido(datosPedido, idUsuarioEmpleado, id_restaurante_contexto) {
    const { id_mesa, id_cliente, items } = datosPedido;
    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error('Se requiere al menos un menú para crear un pedido.');
      error.status = 400; throw error;
    }

    const t = await db.sequelize.transaction();
    try {
      if (id_mesa) {
        const mesa = await db.Mesa.findOne({ where: { id_mesa, id_restaurante: id_restaurante_contexto }, transaction: t });
        if (!mesa) { const error = new Error('La mesa especificada no es válida.'); error.status = 404; throw error; }
        if (mesa.estado === 'Ocupada') {
             const error = new Error(`La mesa ${mesa.numero} ya está ocupada.`); error.status = 409; throw error;
        }
      }
      if (id_cliente) {
        const cliente = await db.Usuario.findByPk(id_cliente, { transaction: t });
        if (!cliente) { const error = new Error('El cliente especificado no es válido.'); error.status = 404; throw error; }
      }

      const idsMenus = items.map(item => item.id_menu);
      const menusValidos = await db.Menu.findAll({
        where: { id_menu: { [Op.in]: idsMenus }, estado: 'Activo', id_restaurante: id_restaurante_contexto },
        transaction: t
      });
      if (menusValidos.length !== idsMenus.length) {
        const error = new Error('Uno o más menús no son válidos, no están activos o no pertenecen al restaurante.');
        error.status = 400; throw error;
      }

      const nuevoPedido = await db.Pedido.create({
        id_mesa, id_usuario_empleado: idUsuarioEmpleado, id_cliente,
        id_restaurante: id_restaurante_contexto, estado: 'Pendiente', subtotal: 0,
      }, { transaction: t });

      const menusMap = new Map(menusValidos.map(menu => [menu.id_menu, menu]));
      const itemsParaCrear = items.map(item => ({
        id_pedido: nuevoPedido.id_pedido,
        id_menu: item.id_menu, // Usamos el nombre lógico del modelo
        cantidad: item.cantidad,
        precio_unitario_momento: menusMap.get(item.id_menu).precio_venta,
        notas_item: item.notas_item,
      }));
      await db.ItemPedido.bulkCreate(itemsParaCrear, { transaction: t });
      
      await recalcularSubtotal(nuevoPedido.id_pedido, t);
      if (id_mesa) {
        await db.Mesa.update({ estado: 'Ocupada' }, { where: { id_mesa }, transaction: t });
      }

      await t.commit();
      return await this.obtenerPedidoPorId(nuevoPedido.id_pedido, id_restaurante_contexto);
    } catch (error) {
      await t.rollback();
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerTodosLosPedidos(filtros = {}, id_restaurante_contexto) {
    const { limite = 20, pagina = 1, estado, fechaDesde, fechaHasta, incluirEliminados = false, ...otrosFiltros } = filtros;
    const offset = (pagina - 1) * parseInt(limite, 10);
    const whereClause = { id_restaurante: id_restaurante_contexto, ...otrosFiltros };
    if (estado) {
        const estados = estado.split(',').map(s => s.trim());
        whereClause.estado = { [Op.in]: estados };
    }
    if (fechaDesde || fechaHasta) {
        whereClause.fecha_creacion = {};
        if (fechaDesde) whereClause.fecha_creacion[Op.gte] = new Date(fechaDesde);
        if (fechaHasta) {
            let hasta = new Date(fechaHasta);
            hasta.setHours(23, 59, 59, 999);
            whereClause.fecha_creacion[Op.lte] = hasta;
        }
    }
    const { count, rows } = await db.Pedido.findAndCountAll({
      where: whereClause,
      include: [
        { model: db.Usuario, as: 'empleado', attributes: ['id_usuario', 'nombre'] },
        { model: db.Mesa, attributes: ['id_mesa', 'numero'] }
      ],
      limit: parseInt(limite, 10), offset, order: [['fecha_creacion', 'DESC']],
      paranoid: !incluirEliminados, distinct: true,
    });
    return {
        totalPedidos: count, pedidos: rows, paginaActual: parseInt(pagina, 10),
        totalPaginas: Math.ceil(count / parseInt(limite, 10)),
    };
  },

  async obtenerPedidoPorId(idPedido, id_restaurante_contexto) {
    return await db.Pedido.findOne({
      where: { id_pedido: idPedido, id_restaurante: id_restaurante_contexto },
      include: [
        { model: db.Usuario, as: 'empleado', attributes: ['id_usuario', 'nombre'] },
        { model: db.Usuario, as: 'cliente', attributes: ['id_usuario', 'nombre'] },
        { model: db.Mesa, attributes: ['id_mesa', 'numero', 'ubicacion'] },
        {
          model: db.ItemPedido,
          as: 'items',
          separate: true,
          include: [{ model: db.Menu, attributes: ['id_menu', 'nombre', 'descripcion'] }]
        }
      ]
    });
  },

  async actualizarEstadoPedido(idPedido, nuevoEstado, id_restaurante_contexto) {
    const t = await db.sequelize.transaction();
    try {
      const pedido = await db.Pedido.findOne({ where: { id_pedido: idPedido, id_restaurante: id_restaurante_contexto }, transaction: t });
      if (!pedido) { const error = new Error('Pedido no encontrado.'); error.status = 404; throw error; }
      if (['Pagado', 'Cancelado'].includes(pedido.estado)) {
          const error = new Error(`No se puede cambiar el estado de un pedido que ya está "${pedido.estado}".`);
          error.status = 409; throw error;
      }
      pedido.estado = nuevoEstado;
      await pedido.save({ transaction: t });
      
      if (['Pagado', 'Cancelado'].includes(nuevoEstado) && pedido.id_mesa) {
          await db.Mesa.update({ estado: 'Libre' }, { where: { id_mesa: pedido.id_mesa }, transaction: t });
      }
      await t.commit();
      return pedido;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async cancelarPedido(idPedido, id_restaurante_contexto) {
    return this.actualizarEstadoPedido(idPedido, 'Cancelado', id_restaurante_contexto);
  },

  async pagarPedido(idPedido, datosPago, id_restaurante_contexto) {
    const t = await db.sequelize.transaction();
    try {
      const pedido = await db.Pedido.findOne({ where: {id_pedido: idPedido, id_restaurante: id_restaurante_contexto}, transaction: t });
      if (!pedido) { const error = new Error('Pedido no encontrado.'); error.status = 404; throw error; }
      if (pedido.estado === 'Pagado') { const error = new Error('Este pedido ya ha sido pagado.'); error.status = 409; throw error; }
      
      const montoAPagar = parseFloat(pedido.subtotal);
      const montoRecibido = parseFloat(datosPago.monto);
      if (montoRecibido < montoAPagar) {
          const error = new Error(`El monto recibido (${montoRecibido}) es menor que el subtotal del pedido (${montoAPagar}).`);
          error.status = 400; throw error;
      }
      const nuevoPago = await db.Pago.create({
          id_pedido: idPedido, monto: montoRecibido, cambio: montoRecibido - montoAPagar,
          metodo_pago: datosPago.metodo_pago, estado: 'Completado'
      }, { transaction: t });
      
      pedido.estado = 'Pagado';
      await pedido.save({ transaction: t });
      if (pedido.id_mesa) {
        await db.Mesa.update({ estado: 'Libre' }, { where: { id_mesa: pedido.id_mesa }, transaction: t });
      }
      await t.commit();
      return { pago: nuevoPago, pedido: await this.obtenerPedidoPorId(idPedido, id_restaurante_contexto) };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  // --- Funciones para Items de Pedido (Menús) ---

  async anadirMenuAPedido(idPedido, datosItem, id_restaurante_contexto) {
    const { id_menu, cantidad, notas_item } = datosItem;
    const t = await db.sequelize.transaction();
    try {
      const pedido = await db.Pedido.findOne({ where: { id_pedido: idPedido, id_restaurante: id_restaurante_contexto }, transaction: t });
      if (!pedido) { const error = new Error('Pedido no encontrado.'); error.status = 404; throw error; }
      if (['Pagado', 'Cancelado'].includes(pedido.estado)) {
          const error = new Error('No se pueden añadir items a un pedido pagado o cancelado.');
          error.status = 409; throw error;
      }
      
      const menu = await db.Menu.findOne({
        where: { id_menu: id_menu, estado: 'Activo', id_restaurante: id_restaurante_contexto },
        transaction: t
      });
      if (!menu) { const error = new Error('Menú no válido, no activo o no pertenece al restaurante.'); error.status = 400; throw error; }

      let itemExistente = await db.ItemPedido.findOne({ where: { id_pedido: idPedido, id_menu: id_menu }, transaction: t });
      if (itemExistente) {
          itemExistente.cantidad += cantidad;
          if (notas_item !== undefined) itemExistente.notas_item = notas_item;
          await itemExistente.save({ transaction: t });
      } else {
          await db.ItemPedido.create({
            id_pedido: idPedido, id_menu, cantidad, notas_item, precio_unitario_momento: menu.precio_venta,
          }, { transaction: t });
      }
      await recalcularSubtotal(idPedido, t);
      await t.commit();
      return await this.obtenerPedidoPorId(idPedido, id_restaurante_contexto);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  async actualizarItemDePedido(idItemPedido, datosActualizacion, id_restaurante_contexto) {
    const { cantidad, notas_item } = datosActualizacion;
    const t = await db.sequelize.transaction();
    try {
      const item = await db.ItemPedido.findOne({
          where: { id_item_pedido: idItemPedido },
          include: [{ model: db.Pedido, where: { id_restaurante: id_restaurante_contexto }, attributes: [] }],
          transaction: t
      });
      if (!item) { const error = new Error('Item de pedido no encontrado.'); error.status = 404; throw error; }

      const idPedido = item.id_pedido;
      let fueEliminado = false;
      if (cantidad !== undefined) {
        const cantidadNum = parseInt(cantidad, 10);
        if (cantidadNum <= 0) {
            await item.destroy({ transaction: t });
            fueEliminado = true;
        } else {
            item.cantidad = cantidadNum;
        }
      }
      if (notas_item !== undefined) item.notas_item = notas_item;
      if (!fueEliminado) await item.save({ transaction: t });
      await recalcularSubtotal(idPedido, t);
      await t.commit();
      return await this.obtenerPedidoPorId(idPedido, id_restaurante_contexto);
    } catch (error) {
        await t.rollback();
        throw error;
    }
  },

  async eliminarItemDePedido(idItemPedido, id_restaurante_contexto) {
    return this.actualizarItemDePedido(idItemPedido, { cantidad: 0 }, id_restaurante_contexto);
  },
};
module.exports = pedidoService;
// services/menuService.js
const db = require('../models');
const { Op } = require('sequelize');

const menuService = {
  // --- CRUD para la entidad Menu ---

  async crearMenu(datosMenu, id_restaurante_contexto) {
    // La creación ahora es más simple, solo se ocupa del menú principal.
    // Los items se añaden con otro método.
    const { nombre, precio_venta, ...otrosDatos } = datosMenu;
    if (!nombre || precio_venta === undefined) {
      const error = new Error('Nombre y precio de venta son obligatorios para el menú.');
      error.status = 400; throw error;
    }
    if (!id_restaurante_contexto) {
        const error = new Error('Restaurante no especificado para el menú.');
        error.status = 400; throw error;
    }

    try {
      const existente = await db.Menu.findOne({
        where: { nombre, id_restaurante: id_restaurante_contexto },
        paranoid: false,
      });
      if (existente) {
        const msg = existente.fecha_eliminacion ? `El menú '${nombre}' ya existe pero está eliminado. Considere restaurarlo.` : `El menú '${nombre}' ya existe.`;
        const error = new Error(msg); error.status = 409; throw error;
      }

      const nuevoMenu = await db.Menu.create({
        nombre, precio_venta, ...otrosDatos,
        id_restaurante: id_restaurante_contexto,
        eliminado: false,
      });

      return nuevoMenu;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerTodosLosMenus(filtros = {}, id_restaurante_contexto) {
    // Esta función no cambia, sigue devolviendo los menús con sus items.
    const { limite = 10, pagina = 1, nombre, estado, incluirEliminados = false } = filtros;
    const offset = (pagina - 1) * parseInt(limite, 10);
    const whereClause = { id_restaurante: id_restaurante_contexto };
    if (nombre) whereClause.nombre = { [Op.like]: `%${nombre}%` };
    if (estado) whereClause.estado = estado;

    const { count, rows } = await db.Menu.findAndCountAll({
      where: whereClause,
      include: [
          {
              model: db.ItemMenu,
              as: 'items',
              attributes: ['id_item_menu', 'id_receta', 'precio_item', 'disponible'],
              required: false, // LEFT JOIN para menús sin items
              include: [{ model: db.Receta, attributes: ['nombre', 'descripcion'] }]
          }
      ],
      limit: parseInt(limite, 10),
      offset: offset,
      order: [['nombre', 'ASC']],
      paranoid: !incluirEliminados,
      distinct: true,
    });
    return {
        totalMenus: count,
        menus: rows,
        paginaActual: parseInt(pagina, 10),
        totalPaginas: Math.ceil(count / parseInt(limite, 10)),
    };
  },

  async obtenerMenuPorId(idMenu, id_restaurante_contexto, incluirEliminados = false) {
    // Esta función no cambia.
    return await db.Menu.findOne({
      where: { id_menu: idMenu, id_restaurante: id_restaurante_contexto },
      include: [
          {
              model: db.ItemMenu,
              as: 'items',
              attributes: ['id_item_menu', 'id_receta', 'precio_item', 'disponible'],
              required: false,
              include: [{ model: db.Receta, attributes: ['nombre', 'descripcion'] }]
          }
      ],
      paranoid: !incluirEliminados,
    });
  },

  async actualizarMenu(idMenu, datosMenu, id_restaurante_contexto) {
    // AHORA SOLO ACTUALIZA LOS DATOS DEL MENÚ, NO LOS ITEMS.
    try {
      const menu = await db.Menu.findOne({
          where: {id_menu: idMenu, id_restaurante: id_restaurante_contexto},
      });
      if (!menu) { const error = new Error('Menú no encontrado.'); error.status = 404; throw error; }

      // ... (verificación de nombre duplicado como antes) ...
      if (datosMenu.nombre && datosMenu.nombre !== menu.nombre) {
          // ...
      }

      // Asegurarse de no permitir la actualización de campos sensibles
      delete datosMenu.id_restaurante;
      delete datosMenu.id_menu;
      delete datosMenu.eliminado;
      delete datosMenu.fecha_eliminacion;

      await menu.update(datosMenu);
      return menu;
    } catch (error) {
        if (!error.status) error.status = 500;
        throw error;
    }
  },

  async eliminarMenu(idMenu, id_restaurante_contexto) {
    // Esta función no cambia, ya manejaba los items asociados por la FK.
    const t = await db.sequelize.transaction();
    try {
        const menu = await db.Menu.findOne({ where: {id_menu: idMenu, id_restaurante: id_restaurante_contexto}, transaction: t });
        if (!menu) { const error = new Error('Menú no encontrado.'); error.status = 404; throw error; }
        await db.ItemMenu.destroy({ where: { id_menu: idMenu }, transaction: t });
        await menu.destroy({ transaction: t });
        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        if (!error.status) error.status = 500;
        throw error;
    }
  },

  async restaurarMenu(idMenu, id_restaurante_contexto) {
    // Esta función no cambia, ya manejaba los items asociados.
    const t = await db.sequelize.transaction();
    try {
        const menu = await db.Menu.findOne({ where: { id_menu: idMenu, id_restaurante: id_restaurante_contexto }, paranoid: false, transaction: t });
        if (!menu) { const error = new Error('Menú no encontrado.'); error.status = 404; throw error; }
        if (!menu.fecha_eliminacion) { const error = new Error('El menú no está eliminado.'); error.status = 400; throw error; }
        await menu.restore({transaction: t});
        await db.ItemMenu.restore({ where: { id_menu: idMenu }, transaction: t });
        await t.commit();
        return await this.obtenerMenuPorId(idMenu, id_restaurante_contexto);
    } catch (error) {
        await t.rollback();
        if (!error.status) error.status = 500;
        throw error;
    }
  },

  // --- MÉTODOS ESPECÍFICOS PARA ITEM_MENU ---

  async anadirItemAMenu(idMenu, datosItem, id_restaurante_contexto) {
    const { id_receta, precio_item, disponible } = datosItem;
    if (id_receta === undefined || precio_item === undefined) {
      const error = new Error('id_receta y precio_item son requeridos para añadir un item.');
      error.status = 400; throw error;
    }

    try {
      const menu = await db.Menu.findOne({ where: {id_menu: idMenu, id_restaurante: id_restaurante_contexto} });
      if (!menu) { const error = new Error('Menú no encontrado.'); error.status = 404; throw error; }

      const receta = await db.Receta.findOne({ where: {id_receta, id_restaurante: id_restaurante_contexto, eliminado: false} });
      if (!receta) { const error = new Error('Receta no encontrada, eliminada o no pertenece a este restaurante.'); error.status = 404; throw error; }

      const itemExistente = await db.ItemMenu.findOne({ where: { id_menu: idMenu, id_receta: id_receta }, paranoid: false });
      if (itemExistente) {
        const msg = itemExistente.eliminado ? 'Este item ya existía en el menú pero fue eliminado. Considere restaurarlo.' : 'Esta receta ya existe en el menú.';
        const error = new Error(msg); error.status = 409; throw error;
      }

      const nuevoItem = await db.ItemMenu.create({
        id_menu: idMenu,
        id_receta: id_receta,
        precio_item: precio_item,
        disponible: disponible !== undefined ? disponible : true,
        eliminado: false,
      });
      return await db.ItemMenu.findByPk(nuevoItem.id_item_menu, {
          include: [{ model: db.Receta, attributes: ['nombre', 'descripcion'] }]
      });
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async actualizarItemDeMenu(idItemMenu, datosItem, id_restaurante_contexto) {
    const { precio_item, disponible } = datosItem;
    if (precio_item === undefined && disponible === undefined) {
      const error = new Error('Se debe proporcionar al menos un campo para actualizar (precio_item o disponible).');
      error.status = 400; throw error;
    }

    try {
      const item = await db.ItemMenu.findOne({
        where: { id_item_menu: idItemMenu },
        include: [{ model: db.Menu, where: { id_restaurante: id_restaurante_contexto }, attributes: [] }]
      });
      if (!item) { const error = new Error('Item de menú no encontrado.'); error.status = 404; throw error; }

      const datosParaActualizar = {};
      if (precio_item !== undefined) datosParaActualizar.precio_item = precio_item;
      if (disponible !== undefined) datosParaActualizar.disponible = disponible;

      await item.update(datosParaActualizar);
      return item;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async eliminarItemDeMenu(idItemMenu, id_restaurante_contexto) {
    try {
      const item = await db.ItemMenu.findOne({
        where: { id_item_menu: idItemMenu },
        include: [{ model: db.Menu, where: { id_restaurante: id_restaurante_contexto }, attributes: [] }]
      });
      if (!item) { const error = new Error('Item de menú no encontrado o ya eliminado.'); error.status = 404; throw error; }
      
      await item.destroy(); // Eliminación lógica gracias a paranoid: true
      return true;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  }
};

module.exports = menuService;
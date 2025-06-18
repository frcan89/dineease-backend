// services/productoService.js
const db = require('../models');
const { Op } = require('sequelize');

const productoService = {
  async crearProducto(datosProducto, idUsuarioLogueado) {
    const t = await db.sequelize.transaction();
    try {
      if (!datosProducto.nombre || !datosProducto.id_restaurante) {
        const error = new Error('Nombre del producto y ID del restaurante son obligatorios.');
        error.status = 400;
        throw error;
      }

      // Verificar si ya existe un producto con el mismo nombre en el mismo restaurante
      const existente = await db.Producto.findOne({
        where: {
          nombre: datosProducto.nombre,
          id_restaurante: datosProducto.id_restaurante,
        },
        paranoid: false, // Incluir eliminados para la verificación
        transaction: t,
      });

      if (existente) {
        if (existente.fecha_eliminacion) { // O existente.eliminado
          const error = new Error(`Ya existe un producto con el nombre '${datosProducto.nombre}' en este restaurante, pero está eliminado. Considere restaurarlo.`);
          error.status = 409; throw error;
        } else {
          const error = new Error(`Ya existe un producto con el nombre '${datosProducto.nombre}' en este restaurante.`);
          error.status = 409; throw error;
        }
      }

      const nuevoProducto = await db.Producto.create({
        ...datosProducto,
        id_usuario_registro: idUsuarioLogueado, // Registrar quién lo creó
        eliminado: false, // Por defecto
      }, { transaction: t });

      // Opcional: Crear entrada en Inventario si no se crea automáticamente
      // Si tienes un hook o lógica para crear inventario al crear producto, esto podría no ser necesario aquí.
      // Asumiendo que se crea el inventario con cantidad 0 por defecto.
      await db.Inventario.create({
        id_producto: nuevoProducto.id_producto,
        cantidad: datosProducto.cantidad_inicial || 0, // Si se provee cantidad inicial
        // ultima_actualizacion es manejada por DDL o modelo Inventario
        eliminado: false,
      }, { transaction: t });


      await t.commit();
      return nuevoProducto;
    } catch (error) {
      await t.rollback();
      console.error('Error al crear producto:', error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerTodosLosProductos(filtros = {}) {
    try {
      const {
        limite = 10, pagina = 1, nombre, id_restaurante,
        unidad_medida, incluirEliminados = false
      } = filtros;

      const offset = (pagina - 1) * limite;
      const whereClause = {};

      if (id_restaurante === undefined) { // Es crucial filtrar por restaurante si la data es multi-tenant
          const error = new Error("El filtro 'id_restaurante' es obligatorio para listar productos.");
          error.status = 400;
          throw error;
      }
      whereClause.id_restaurante = id_restaurante;

      if (nombre) whereClause.nombre = { [Op.like]: `%${nombre}%` };
      if (unidad_medida) whereClause.unidad_medida = unidad_medida;

      const { count, rows } = await db.Producto.findAndCountAll({
        where: whereClause,
        include: [
          { model: db.Usuario, as: 'usuarioRegistro', attributes: ['id_usuario', 'nombre'] },
          { model: db.Restaurante, attributes: ['id_restaurante', 'nombre'] }, // Ajusta PK si es id_restaurante
          { model: db.Inventario, attributes: ['cantidad', 'fecha_actualizacion'] } // Incluir cantidad del inventario
        ],
        limit: parseInt(limite, 10),
        offset: parseInt(offset, 10),
        order: [['nombre', 'ASC']],
        paranoid: !incluirEliminados,
        distinct: true,
      });

      return {
        totalProductos: count,
        productos: rows,
        paginaActual: parseInt(pagina, 10),
        totalPaginas: Math.ceil(count / limite),
      };
    } catch (error) { /* ... manejo de error ... */ throw error; }
  },

  async obtenerProductoPorId(idProducto, id_restaurante, incluirEliminados = false) {
    try {
      const whereClause = { id_producto: idProducto };
      if (id_restaurante !== undefined) { // Asegurar que el producto pertenezca al restaurante si se provee
          whereClause.id_restaurante = id_restaurante;
      }

      const producto = await db.Producto.findOne({ // Usar findOne para aplicar el whereClause del restaurante
        where: whereClause,
        include: [
          { model: db.Usuario, as: 'usuarioRegistro', attributes: ['id_usuario', 'nombre'] },
          { model: db.Restaurante, attributes: ['id_restaurante', 'nombre'] },
          { model: db.Inventario, attributes: ['cantidad', 'fecha_actualizacion'] }
        ],
        paranoid: !incluirEliminados,
      });
      return producto;
    } catch (error) { /* ... manejo de error ... */ throw error; }
  },

  async actualizarProducto(idProducto, datosActualizacion, idUsuarioLogueado, id_restaurante_contexto) {
    const t = await db.sequelize.transaction();
    try {
      const producto = await db.Producto.findOne({
          where: { id_producto: idProducto, id_restaurante: id_restaurante_contexto }, // Asegurar que pertenece al restaurante del usuario
          transaction: t
      });

      if (!producto) {
        const error = new Error('Producto no encontrado en este restaurante o ya está eliminado.');
        error.status = 404; throw error;
      }

      if (datosActualizacion.nombre && datosActualizacion.nombre !== producto.nombre) {
        const existente = await db.Producto.findOne({
          where: {
            nombre: datosActualizacion.nombre,
            id_restaurante: producto.id_restaurante,
            id_producto: { [Op.ne]: idProducto }
          },
          paranoid: false, // Verificar contra todos
          transaction: t,
        });
        if (existente) {
            const msg = existente.fecha_eliminacion ? `Ya existe un producto con el nombre '${datosActualizacion.nombre}' pero está eliminado. Considere restaurarlo.` : 'Ya existe otro producto con ese nombre en este restaurante.';
            const error = new Error(msg); error.status = 409; throw error;
        }
      }

      // No permitir cambiar id_restaurante directamente, eso sería otra lógica (mover producto)
      delete datosActualizacion.id_restaurante;
      delete datosActualizacion.eliminado;
      delete datosActualizacion.fecha_eliminacion;

      await producto.update({
        ...datosActualizacion,
        id_usuario_registro: idUsuarioLogueado, // Registrar quién lo modificó
      }, { transaction: t });

      await t.commit();
      return await this.obtenerProductoPorId(idProducto, id_restaurante_contexto);
    } catch (error) {
      await t.rollback();
      console.error('Error al actualizar producto:', error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async eliminarProducto(idProducto, id_restaurante_contexto) {
    const t = await db.sequelize.transaction();
    try {
      const producto = await db.Producto.findOne({
          where: { id_producto: idProducto, id_restaurante: id_restaurante_contexto },
          transaction: t
      });

      if (!producto) {
        const error = new Error('Producto no encontrado en este restaurante o ya está eliminado.');
        error.status = 404; throw error;
      }

      // Opcional: Verificar si el producto está en uso (ej. en recetas activas, items de menú disponibles)
      // Esta lógica puede ser compleja. Por ahora, solo eliminamos el producto y su inventario.

      const inventario = await db.Inventario.findOne({ where: {id_producto: idProducto}, transaction: t});
      if (inventario) {
          await inventario.destroy({transaction: t}); // Esto activará el hook de Inventario si lo tiene
      }
      // Considerar qué pasa con MovimientoInventario (¿se mantienen por historial?)

      await producto.destroy({ transaction: t }); // Esto activará el hook de Producto
      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      console.error('Error al eliminar producto:', error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async restaurarProducto(idProducto, id_restaurante_contexto) {
    const t = await db.sequelize.transaction();
    try {
      const producto = await db.Producto.findOne({
          where: { id_producto: idProducto, id_restaurante: id_restaurante_contexto },
          paranoid: false, // Buscar incluyendo eliminados
          transaction: t
      });

      if (!producto) {
        const error = new Error('Producto no encontrado.'); error.status = 404; throw error;
      }
      if (!producto.fecha_eliminacion) { // O !producto.eliminado
        const error = new Error('El producto no está eliminado.'); error.status = 400; throw error;
      }

      await producto.restore({ transaction: t }); // Activa hook de Producto

      // Restaurar inventario si fue eliminado lógicamente
      const inventario = await db.Inventario.findOne({ where: {id_producto: idProducto}, paranoid: false, transaction: t});
      if (inventario && inventario.fecha_eliminacion) { // O inventario.eliminado
          await inventario.restore({transaction: t}); // Activa hook de Inventario si lo tiene
      } else if (!inventario) {
          // Si el inventario fue eliminado físicamente o no existía, se podría recrear aquí
          await db.Inventario.create({id_producto: idProducto, cantidad: 0, eliminado: false}, {transaction: t});
      }


      await t.commit();
      return await this.obtenerProductoPorId(idProducto, id_restaurante_contexto);
    } catch (error) {
      await t.rollback();
      console.error('Error al restaurar producto:', error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },
};

module.exports = productoService;
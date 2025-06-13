const db = require('../models');
const { Op } = require('sequelize');

const productoService = {
  async crearProducto(datosProducto) {
    try {
      if (!datosProducto.nombre || !datosProducto.unidad_medida || !datosProducto.idRestaurante) {
        const error = new Error('Nombre, unidad de medida e ID del restaurante son obligatorios.');
        error.status = 400;
        throw error;
      }

      // Check if product with the same name already exists for the same restaurant
      const existente = await db.Producto.findOne({
        where: {
          nombre: datosProducto.nombre,
          idRestaurante: datosProducto.idRestaurante,
        },
        paranoid: false, // Check even among deleted ones
      });

      if (existente) {
        if (existente.fecha_eliminacion) { // Or your equivalent field for soft delete
          const error = new Error(`Ya existe un producto con el nombre '${datosProducto.nombre}' en este restaurante, pero está eliminado. Considere restaurarlo.`);
          error.status = 409;
          throw error;
        }
        const error = new Error(`Ya existe un producto con el nombre '${datosProducto.nombre}' en este restaurante.`);
        error.status = 409;
        throw error;
      }
      // Ensure idUsuario is passed or set to null if not provided
      datosProducto.idUsuario = datosProducto.idUsuario || null;

      const nuevoProducto = await db.Producto.create(datosProducto);
      return nuevoProducto;
    } catch (error) {
      console.error('Error al crear producto en el servicio:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerTodosLosProductos(filtros = {}) {
    try {
      const { limite = 10, pagina = 1, nombre, idRestaurante, incluirEliminados = false } = filtros;
      const offset = (pagina - 1) * limite;
      const whereClause = {};

      if (nombre) {
        whereClause.nombre = { [Op.iLike]: `%${nombre}%` }; // Case-insensitive like
      }
      if (idRestaurante) {
        whereClause.idRestaurante = idRestaurante;
      } else {
        // If idRestaurante is not provided, it might be an admin query or an error
        // Depending on policy, you might throw an error or allow it (e.g., for system admins)
        // For now, let's assume if idRestaurante is not present, we don't filter by it,
        // but typically you'd want to enforce this for most user roles.
      }

      const { count, rows } = await db.Producto.findAndCountAll({
        where: whereClause,
        limit: parseInt(limite, 10),
        offset: parseInt(offset, 10),
        order: [['nombre', 'ASC']],
        paranoid: !incluirEliminados,
        include: [ // Include associated models if needed, e.g., Restaurante
          { model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] },
          // { model: db.Usuario, as: 'Creador', attributes: ['idUsuario', 'nombre'] } // If an alias is set
        ]
      });

      return {
        totalProductos: count,
        productos: rows,
        paginaActual: parseInt(pagina, 10),
        totalPaginas: Math.ceil(count / limite),
      };
    } catch (error) {
      console.error('Error al obtener todos los productos en el servicio:', error);
      error.status = 500;
      throw error;
    }
  },

  async obtenerProductoPorId(idProducto, incluirEliminados = false) {
    try {
      const producto = await db.Producto.findByPk(idProducto, {
        paranoid: !incluirEliminados,
        include: [
            { model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] },
        ]
      });
      return producto;
    } catch (error) {
      console.error('Error al obtener producto por ID en el servicio:', error);
      error.status = 500;
      throw error;
    }
  },

  async actualizarProducto(idProducto, datosActualizacion) {
    try {
      const producto = await db.Producto.findByPk(idProducto, { paranoid: false }); // Find even if soft-deleted
      if (!producto) {
        const error = new Error('Producto no encontrado.');
        error.status = 404;
        throw error;
      }

      // Check for name conflict if name is being changed
      if (datosActualizacion.nombre && datosActualizacion.nombre !== producto.nombre) {
        const existente = await db.Producto.findOne({
          where: {
            nombre: datosActualizacion.nombre,
            idRestaurante: producto.idRestaurante, // Check within the same restaurant
            idProducto: { [Op.ne]: idProducto },
          },
          paranoid: false,
        });
        if (existente) {
          const error = new Error(`Ya existe otro producto con el nombre '${datosActualizacion.nombre}' en este restaurante.`);
          error.status = 409;
          throw error;
        }
      }
      // Prevent changing idRestaurante if not allowed
      if (datosActualizacion.idRestaurante && datosActualizacion.idRestaurante !== producto.idRestaurante) {
          const error = new Error('No se permite cambiar el restaurante de un producto.');
          error.status = 400; // Or 403 Forbidden
          throw error;
      }


      await producto.update(datosActualizacion);
      return producto;
    } catch (error) {
      console.error('Error al actualizar producto en el servicio:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async eliminarProducto(idProducto) {
    const transaction = await db.sequelize.transaction();
    try {
      const producto = await db.Producto.findByPk(idProducto, { transaction });
      if (!producto) {
        await transaction.rollback();
        const error = new Error('Producto no encontrado para eliminar.');
        error.status = 404;
        throw error;
      }

      // Check for dependencies before deleting (e.g., if product is in an active ItemMenu or Receta)
      // Example: Check IngredienteReceta
      const enRecetas = await db.IngredienteReceta.count({ where: { idProducto }, transaction });
      if (enRecetas > 0) {
        await transaction.rollback();
        const error = new Error('No se puede eliminar el producto porque está siendo utilizado en recetas.');
        error.status = 409; // Conflict
        throw error;
      }

      // Example: Check ItemMenu (assuming Producto can be directly an ItemMenu or part of one)
      // This depends on your exact schema. If Producto is linked via Receta to ItemMenu,
      // the above check might be sufficient. If Producto can be an ItemMenu directly, add check:
      // const enItemMenu = await db.ItemMenu.count({ where: { /* some link to idProducto */ }, transaction });
      // if (enItemMenu > 0) {
      //   await transaction.rollback();
      //   const error = new Error('No se puede eliminar el producto porque está asociado a un ítem del menú.');
      //   error.status = 409;
      //   throw error;
      // }


      // Soft delete (paranoid model handles setting deletedAt)
      await producto.destroy({ transaction });

      // If you have an explicit 'eliminado' boolean field in your model (Producto.js)
      // that is not automatically handled by `deletedAt` (e.g. `field: 'eliminado'`),
      // you might need to update it manually.
      // await producto.update({ eliminado: true }, { transaction, paranoid: false });


      await transaction.commit();
      return true; // Or return the product instance if preferred
    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar producto en el servicio:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async restaurarProducto(idProducto) {
    const transaction = await db.sequelize.transaction();
    try {
      const producto = await db.Producto.findByPk(idProducto, {
        paranoid: false, // Find even if soft-deleted
        transaction,
      });

      if (!producto) {
        await transaction.rollback();
        const error = new Error('Producto no encontrado.');
        error.status = 404;
        throw error;
      }

      if (!producto.fecha_eliminacion) { // Or your equivalent field
        await transaction.rollback();
        const error = new Error('El producto no está eliminado.');
        error.status = 400;
        throw error;
      }

      await producto.restore({ transaction });

      // If you have an explicit 'eliminado' boolean field:
      // await producto.update({ eliminado: false }, { transaction });

      await transaction.commit();
      // Return the restored product, refetching it to get the updated state
      return await db.Producto.findByPk(idProducto);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al restaurar producto en el servicio:', error);
      if (!error.status) error.status = 500;
      throw error;
    }
  },
};

module.exports = productoService;

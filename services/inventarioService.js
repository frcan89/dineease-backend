const { Inventario, Producto } = require('../models');

const inventarioService = {
  async crearInventario(datosInventario) {
    const { idProducto, cantidad, ubicacion, proveedor, precio_compra, fecha_adquisicion } = datosInventario;

    if (!idProducto) {
      throw new Error('El campo idProducto es obligatorio.');
    }

    // Verificar que el producto exista
    const productoExistente = await Producto.findByPk(idProducto);
    if (!productoExistente) {
      throw new Error(`El producto con ID ${idProducto} no existe.`);
    }

    // Verificar que no exista un inventario para este producto
    const inventarioExistente = await Inventario.findOne({ where: { idProducto } });
    if (inventarioExistente) {
      throw new Error(`Ya existe un inventario para el producto con ID ${idProducto}.`);
    }

    try {
      const nuevoInventario = await Inventario.create({
        idProducto,
        cantidad,
        ubicacion,
        proveedor,
        precio_compra,
        fecha_adquisicion,
        ultima_actualizacion: new Date(), // Establecer la fecha de última actualización
      });
      return nuevoInventario;
    } catch (error) {
      // Podría ser un error de validación de la BD u otro
      throw new Error(`Error al crear el inventario: ${error.message}`);
    }
  },

  async obtenerTodosLosInventarios(filtros = {}) {
    const { limite, pagina, idProducto } = filtros;
    const opciones = {
      include: [{ model: Producto, as: 'producto' }],
      where: {},
    };

    if (limite && pagina) {
      opciones.limit = parseInt(limite, 10);
      opciones.offset = (parseInt(pagina, 10) - 1) * opciones.limit;
    }

    if (idProducto) {
      opciones.where.idProducto = idProducto;
    }

    try {
      const inventarios = await Inventario.findAndCountAll(opciones);
      return inventarios;
    } catch (error) {
      throw new Error(`Error al obtener los inventarios: ${error.message}`);
    }
  },

  async obtenerInventarioPorId(idInventario) {
    try {
      const inventario = await Inventario.findByPk(idInventario, {
        include: [{ model: Producto, as: 'producto' }],
      });
      if (!inventario) {
        throw new Error(`Inventario con ID ${idInventario} no encontrado.`);
      }
      return inventario;
    } catch (error) {
      throw new Error(`Error al obtener el inventario por ID: ${error.message}`);
    }
  },

  async obtenerInventarioPorIdProducto(idProducto) {
    if (!idProducto) {
      throw new Error('El parámetro idProducto es obligatorio.');
    }
    try {
      const inventario = await Inventario.findOne({
        where: { idProducto },
        include: [{ model: Producto, as: 'producto' }],
      });
      if (!inventario) {
        throw new Error(`Inventario para el producto con ID ${idProducto} no encontrado.`);
      }
      return inventario;
    } catch (error) {
      throw new Error(`Error al obtener el inventario por ID de producto: ${error.message}`);
    }
  },

  async actualizarInventario(idInventario, datosActualizacion) {
    const { idProducto } = datosActualizacion;

    try {
      const inventario = await Inventario.findByPk(idInventario);
      if (!inventario) {
        throw new Error(`Inventario con ID ${idInventario} no encontrado.`);
      }

      // Si se está actualizando idProducto, verificar que el nuevo producto exista
      if (idProducto && idProducto !== inventario.idProducto) {
        const productoExistente = await Producto.findByPk(idProducto);
        if (!productoExistente) {
          throw new Error(`El producto con ID ${idProducto} no existe.`);
        }
        // También verificar que no exista ya un inventario para el NUEVO idProducto
        // a menos que sea el mismo registro que estamos actualizando.
        const inventarioExistenteConNuevoProducto = await Inventario.findOne({
          where: { idProducto, idInventario: { [Inventario.sequelize.Op.ne]: idInventario } },
        });
        if (inventarioExistenteConNuevoProducto) {
          throw new Error(`Ya existe un inventario para el producto con ID ${idProducto}.`);
        }
      }

      // Actualizar los campos
      const datosParaActualizar = {
        ...datosActualizacion,
        ultima_actualizacion: new Date(),
      };

      await inventario.update(datosParaActualizar);
      // Recargar la instancia para obtener los datos actualizados, incluyendo el producto asociado si es necesario
      return await Inventario.findByPk(idInventario, {
        include: [{ model: Producto, as: 'producto' }],
      });
    } catch (error) {
      throw new Error(`Error al actualizar el inventario: ${error.message}`);
    }
  },

  async eliminarInventario(idInventario) {
    try {
      const inventario = await Inventario.findByPk(idInventario);
      if (!inventario) {
        throw new Error(`Inventario con ID ${idInventario} no encontrado.`);
      }
      await inventario.destroy();
      return { mensaje: `Inventario con ID ${idInventario} eliminado exitosamente.` };
    } catch (error) {
      throw new Error(`Error al eliminar el inventario: ${error.message}`);
    }
  },
};

module.exports = inventarioService;

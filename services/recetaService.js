// services/recetaService.js
const db = require('../models');
const { Op } = require('sequelize');

const recetaService = {
  async crearReceta(datosReceta, idUsuarioLogueado, id_restaurante_contexto) {
    const { nombre, descripcion, tiempo_preparacion, instrucciones, porciones, precio_costo, ingredientes } = datosReceta;

    if (!nombre) {
      const error = new Error('El nombre de la receta es obligatorio.');
      error.status = 400; throw error;
    }
    if (!id_restaurante_contexto) {
        const error = new Error('Restaurante no especificado para la receta.');
        error.status = 400; throw error;
    }

    const t = await db.sequelize.transaction();
    try {
      // Verificar si ya existe receta con mismo nombre en el restaurante
      const existente = await db.Receta.findOne({
        where: { nombre, id_restaurante: id_restaurante_contexto },
        paranoid: false, transaction: t
      });
      if (existente) {
        const msg = existente.fecha_eliminacion ? `La receta '${nombre}' ya existe pero está eliminada. Considere restaurarla.` : `La receta '${nombre}' ya existe en este restaurante.`;
        const error = new Error(msg); error.status = 409; throw error;
      }

      const nuevaReceta = await db.Receta.create({
        nombre, descripcion, tiempo_preparacion, instrucciones, porciones, precio_costo,
        id_restaurante: id_restaurante_contexto,
        eliminado: false,
      }, { transaction: t });

      if (ingredientes && ingredientes.length > 0) {
        // Validar que todos los productos ingredientes existan y pertenezcan al mismo restaurante
        const idsProductos = ingredientes.map(ing => ing.id_producto);
        const productosExistentes = await db.Producto.findAll({
            where: { id_producto: { [Op.in]: idsProductos }, id_restaurante: id_restaurante_contexto },
            attributes: ['id_producto'],
            transaction: t
        });
        if (productosExistentes.length !== idsProductos.length) {
            const error = new Error('Uno o más productos ingredientes no son válidos o no pertenecen al restaurante.');
            error.status = 400; throw error;
        }

        const ingredientesParaCrear = ingredientes.map(ing => ({
          id_receta: nuevaReceta.id_receta,
          id_producto: ing.id_producto,
          cantidad: ing.cantidad,
          unidad_medida_receta: ing.unidad_medida_receta,
          eliminado: false,
        }));
        await db.IngredienteReceta.bulkCreate(ingredientesParaCrear, { transaction: t });
      }

      await t.commit();
      return await this.obtenerRecetaPorId(nuevaReceta.id_receta, id_restaurante_contexto);
    } catch (error) {
      await t.rollback();
      console.error("Error creando receta:", error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerTodasLasRecetas(filtros = {}, id_restaurante_contexto) {
    const { limite = 10, pagina = 1, nombre, incluirEliminados = false } = filtros;
    const offset = (pagina - 1) * limite;
    const whereClause = { id_restaurante: id_restaurante_contexto }; // Siempre filtrar por restaurante
    if (nombre) whereClause.nombre = { [Op.like]: `%${nombre}%` };

    const { count, rows } = await db.Receta.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.Producto,
          as: 'ingredientes',
          attributes: ['id_producto', 'nombre', 'unidad_medida'],
          through: {
            model: db.IngredienteReceta,
            as: 'detallesIngrediente', // Alias para los atributos de la tabla intermedia
            attributes: ['cantidad', 'unidad_medida_receta'],
            // paranoid: !incluirEliminados, // Si IngredienteReceta es paranoid
          },
          required: false, // LEFT JOIN para traer recetas sin ingredientes
          // paranoid: !incluirEliminados, // Si Producto es paranoid
        }
      ],
      limit: parseInt(limite, 10),
      offset: parseInt(offset, 10),
      order: [['nombre', 'ASC']],
      paranoid: !incluirEliminados,
      distinct: true, // Importante con belongsToMany para el count
    });
    return { /* ... resultado paginado ... */ };
  },

  async obtenerRecetaPorId(idReceta, id_restaurante_contexto, incluirEliminados = false) {
    return await db.Receta.findOne({
      where: { id_receta: idReceta, id_restaurante: id_restaurante_contexto },
      include: [
        {
          model: db.Producto,
          as: 'ingredientes',
          attributes: ['id_producto', 'nombre', 'unidad_medida'],
          through: {
            model: db.IngredienteReceta,
            as: 'detallesIngrediente',
            attributes: ['id_ingrediente_receta','cantidad', 'unidad_medida_receta'], // Incluir ID del ingrediente específico
            // paranoid: !incluirEliminados, // Si IngredienteReceta es paranoid
          },
          required: false,
          // paranoid: !incluirEliminados, // Si Producto es paranoid
        }
      ],
      paranoid: !incluirEliminados,
    });
  },

  async actualizarReceta(idReceta, datosActualizacion, idUsuarioLogueado, id_restaurante_contexto) {
    const { nombre, descripcion, tiempo_preparacion, instrucciones, porciones, precio_costo, ingredientes } = datosActualizacion;
    const t = await db.sequelize.transaction();
    try {
      const receta = await db.Receta.findOne({
        where: { id_receta: idReceta, id_restaurante: id_restaurante_contexto },
        transaction: t
      });
      if (!receta) { const error = new Error('Receta no encontrada.'); error.status = 404; throw error; }

      if (nombre && nombre !== receta.nombre) {
        const existente = await db.Receta.findOne({
          where: { nombre, id_restaurante: id_restaurante_contexto, id_receta: { [Op.ne]: idReceta } },
          paranoid: false, transaction: t
        });
        if (existente) { /* ... manejo de error por duplicado ... */ }
      }

      const camposReceta = { nombre, descripcion, tiempo_preparacion, instrucciones, porciones, precio_costo };
      // Filtrar campos undefined para no sobrescribir con null si no se envían
      Object.keys(camposReceta).forEach(key => camposReceta[key] === undefined && delete camposReceta[key]);
      if (Object.keys(camposReceta).length > 0) {
        await receta.update(camposReceta, { transaction: t });
      }


      // Manejo de ingredientes: usualmente se eliminan los existentes y se añaden los nuevos.
      if (ingredientes !== undefined) { // Solo si se envía el array de ingredientes (puede ser vacío)
        // Validar productos
        if (ingredientes.length > 0) {
            const idsProductos = ingredientes.map(ing => ing.id_producto);
            const productosExistentes = await db.Producto.findAll({
                where: { id_producto: { [Op.in]: idsProductos }, id_restaurante: id_restaurante_contexto },
                attributes: ['id_producto'], transaction: t
            });
            if (productosExistentes.length !== idsProductos.filter(id => id != null).length) { // Filtrar nulls por si acaso
                const error = new Error('Uno o más productos ingredientes no son válidos o no pertenecen al restaurante.');
                error.status = 400; throw error;
            }
        }

        // Opción 1: Eliminar todos los ingredientes antiguos y crear los nuevos
        await db.IngredienteReceta.destroy({ where: { id_receta: idReceta }, transaction: t });
        if (ingredientes.length > 0) {
          const nuevosIngredientes = ingredientes.map(ing => ({
            id_receta: idReceta,
            id_producto: ing.id_producto,
            cantidad: ing.cantidad,
            unidad_medida_receta: ing.unidad_medida_receta,
            eliminado: false
          }));
          await db.IngredienteReceta.bulkCreate(nuevosIngredientes, { transaction: t });
        }
        // Opción 2 (más compleja): Comparar arrays, actualizar existentes, añadir nuevos, eliminar sobrantes.
        // La Opción 1 es más simple para un CRUD.
      }

      await t.commit();
      return await this.obtenerRecetaPorId(idReceta, id_restaurante_contexto);
    } catch (error) {
      await t.rollback();
      console.error("Error actualizando receta:", error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async eliminarReceta(idReceta, id_restaurante_contexto) {
    const t = await db.sequelize.transaction();
    try {
      const receta = await db.Receta.findOne({
        where: { id_receta: idReceta, id_restaurante: id_restaurante_contexto },
        transaction: t
      });
      if (!receta) { const error = new Error('Receta no encontrada o ya eliminada.'); error.status = 404; throw error; }

      // Opcional: Verificar si la receta está en uso en ItemMenu activos
      const itemsMenuActivos = await db.ItemMenu.count({ where: { id_receta: idReceta, disponible: true /* u otro estado activo */ }});
      if (itemsMenuActivos > 0) {
          const error = new Error('No se puede eliminar la receta porque está en uso en uno o más items de menú activos.');
          error.status = 409; throw error;
      }


      // Eliminar (lógicamente o físicamente) los ingredientes asociados
      // Si IngredienteReceta es paranoid, destroy() hará soft delete.
      // Si no es paranoid, los eliminará físicamente.
      // Por DDL, fk_ingrediente_receta_id_receta tiene ON DELETE CASCADE,
      // así que la BD podría encargarse de esto si la receta se elimina físicamente.
      // Pero como Receta es paranoid, es mejor manejarlo explícitamente.
      await db.IngredienteReceta.destroy({ where: { id_receta: idReceta }, transaction: t });

      await receta.destroy({ transaction: t }); // Activa hook de Receta
      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async restaurarReceta(idReceta, id_restaurante_contexto) {
    const t = await db.sequelize.transaction();
    try {
      const receta = await db.Receta.findOne({
        where: { id_receta: idReceta, id_restaurante: id_restaurante_contexto },
        paranoid: false, transaction: t
      });
      if (!receta) { const error = new Error('Receta no encontrada.'); error.status = 404; throw error; }
      if (!receta.fecha_eliminacion) { const error = new Error('La receta no está eliminada.'); error.status = 400; throw error; }

      await receta.restore({ transaction: t }); // Activa hook de Receta

      // Restaurar ingredientes si IngredienteReceta usa paranoid y fueron eliminados con la receta
      await db.IngredienteReceta.restore({ where: { id_receta: idReceta }, transaction: t });


      await t.commit();
      return await this.obtenerRecetaPorId(idReceta, id_restaurante_contexto);
    } catch (error) {
      await t.rollback();
      if (!error.status) error.status = 500;
      throw error;
    }
  },
};

module.exports = recetaService;
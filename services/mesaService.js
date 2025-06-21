// services/mesaService.js
const db = require('../models');
const { Op } = require('sequelize');

const mesaService = {
  async crearMesa(datosMesa, id_restaurante_contexto) {
    try {
      const { numero, capacidad, estado, ubicacion } = datosMesa;

      if (numero === undefined || numero === null) { // Puede ser 0 si es un número
        const error = new Error('El número de mesa es obligatorio.');
        error.status = 400; throw error;
      }
      if (!id_restaurante_contexto) {
          const error = new Error('Restaurante no especificado para la mesa.');
          error.status = 400; throw error;
      }

      // Verificar si ya existe mesa con mismo número en el restaurante
      const existente = await db.Mesa.findOne({
        where: { numero, id_restaurante: id_restaurante_contexto },
        paranoid: false, // Incluir eliminadas para la verificación
      });
      if (existente) {
        const msg = existente.fecha_eliminacion ? `La mesa número '${numero}' ya existe pero está eliminada. Considere restaurarla.` : `La mesa número '${numero}' ya existe en este restaurante.`;
        const error = new Error(msg); error.status = 409; throw error;
      }

      const nuevaMesa = await db.Mesa.create({
        numero,
        capacidad, // Usará el defaultValue del modelo si es undefined
        estado,    // Usará el defaultValue del modelo si es undefined
        ubicacion,
        id_restaurante: id_restaurante_contexto,
        eliminado: false,
      });
      return nuevaMesa;
    } catch (error) {
      console.error("Error creando mesa:", error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerTodasLasMesas(filtros = {}, id_restaurante_contexto) {
    try {
      const { limite = 20, pagina = 1, numero, estado, ubicacion, capacidad_min, incluirEliminados = false } = filtros;
      const offset = (pagina - 1) * parseInt(limite, 10);
      const whereClause = { id_restaurante: id_restaurante_contexto }; // Siempre filtrar por restaurante

      if (numero !== undefined) whereClause.numero = numero;
      if (estado) whereClause.estado = estado;
      if (ubicacion) whereClause.ubicacion = { [Op.like]: `%${ubicacion}%` };
      if (capacidad_min !== undefined) whereClause.capacidad = { [Op.gte]: parseInt(capacidad_min, 10) };


      const { count, rows } = await db.Mesa.findAndCountAll({
        where: whereClause,
        // include: [{ model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] }], // Opcional
        limit: parseInt(limite, 10),
        offset: offset,
        order: [['numero', 'ASC']], // O por ubicación, luego número
        paranoid: !incluirEliminados,
        distinct: true,
      });
      return {
        totalMesas: count,
        mesas: rows,
        paginaActual: parseInt(pagina, 10),
        totalPaginas: Math.ceil(count / parseInt(limite, 10)),
      };
    } catch (error) { /* ... manejo de error ... */ throw error; }
  },

  async obtenerMesaPorId(idMesa, id_restaurante_contexto, incluirEliminados = false) {
    try {
      const mesa = await db.Mesa.findOne({
        where: { id_mesa: idMesa, id_restaurante: id_restaurante_contexto },
        // include: [{ model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] }],
        paranoid: !incluirEliminados,
      });
      return mesa;
    } catch (error) { /* ... manejo de error ... */ throw error; }
  },

  async actualizarMesa(idMesa, datosActualizacion, id_restaurante_contexto) {
    try {
      const mesa = await db.Mesa.findOne({
          where: {id_mesa: idMesa, id_restaurante: id_restaurante_contexto}
      });
      if (!mesa) {
        const error = new Error('Mesa no encontrada en este restaurante o ya está eliminada.');
        error.status = 404; throw error;
      }

      const { numero, ...otrosDatos } = datosActualizacion;

      if (numero !== undefined && numero !== mesa.numero) {
        const existente = await db.Mesa.findOne({
          where: {
            numero,
            id_restaurante: id_restaurante_contexto,
            id_mesa: { [Op.ne]: idMesa }
          },
          paranoid: false,
        });
        if (existente) {
          const msg = existente.fecha_eliminacion ? `La mesa número '${numero}' ya existe pero está eliminada. Considere restaurarla.` : `La mesa número '${numero}' ya existe en este restaurante.`;
          const error = new Error(msg); error.status = 409; throw error;
        }
        otrosDatos.numero = numero; // Añadir número a los datos si cambió y es válido
      }

      // No permitir cambiar id_restaurante, eliminado, fecha_eliminacion directamente
      delete otrosDatos.id_restaurante;
      delete otrosDatos.eliminado;
      delete otrosDatos.fecha_eliminacion;

      await mesa.update(otrosDatos);
      return mesa;
    } catch (error) {
      console.error("Error actualizando mesa:", error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async eliminarMesa(idMesa, id_restaurante_contexto) {
    try {
      const mesa = await db.Mesa.findOne({
          where: {id_mesa: idMesa, id_restaurante: id_restaurante_contexto}
      });
      if (!mesa) {
        const error = new Error('Mesa no encontrada en este restaurante o ya eliminada.');
        error.status = 404; throw error;
      }

      // Verificar si la mesa tiene pedidos activos/abiertos
      // (Esto dependerá de cómo modeles el estado del pedido y su relación con la mesa)
      const pedidosActivos = await db.Pedido.count({
          where: {
              id_mesa: idMesa,
              estado: { [Op.notIn]: ['Pagado', 'Cancelado', 'Cerrado'] } // Estados que indican que el pedido ya no está "activo" en la mesa
          }
      });
      if (pedidosActivos > 0) {
          const error = new Error('No se puede eliminar la mesa porque tiene pedidos activos o pendientes.');
          error.status = 409; // Conflict
          throw error;
      }

      await mesa.destroy(); // Activa hook de Mesa
      return true;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async restaurarMesa(idMesa, id_restaurante_contexto) {
    try {
      const mesa = await db.Mesa.findOne({
        where: { id_mesa: idMesa, id_restaurante: id_restaurante_contexto },
        paranoid: false, // Buscar incluyendo eliminadas
      });
      if (!mesa) {
        const error = new Error('Mesa no encontrada.'); error.status = 404; throw error;
      }
      if (!mesa.fecha_eliminacion) { // O !mesa.eliminado
        const error = new Error('La mesa no está eliminada.'); error.status = 400; throw error;
      }
      await mesa.restore(); // Activa hook de Mesa
      return mesa;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },
};

module.exports = mesaService;
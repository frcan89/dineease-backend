const db = require('../models');
const { Op } = require('sequelize');

const permisoService = {
  async crearPermiso(datosPermiso) {
    try {
      if (!datosPermiso.nombre) {
        const error = new Error('El nombre del permiso es obligatorio.');
        error.status = 400;
        throw error;
      }
      const existente = await db.Permiso.findOne({
        where: { nombre: datosPermiso.nombre },
        paranoid: false,
      });
      if (existente) {
        if (existente.fecha_eliminacion) {
          const error = new Error(`Ya existe un permiso con el nombre '${datosPermiso.nombre}' pero está eliminado. Considere restaurarlo.`);
          error.status = 409; throw error;
        } else {
          const error = new Error('Ya existe un permiso con ese nombre.');
          error.status = 409; throw error;
        }
      }
      const nuevoPermiso = await db.Permiso.create(datosPermiso);
      return nuevoPermiso;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerTodosLosPermisos(filtros = {}) {
    const { limite = 100, pagina = 1, nombre, incluirEliminados = false } = filtros; // Aumentar limite por defecto para permisos
    const offset = (pagina - 1) * limite;
    const whereClause = {};
    if (nombre) {
      whereClause.nombre = { [Op.like]: `%${nombre}%` };
    }
    const { count, rows } = await db.Permiso.findAndCountAll({
      where: whereClause,
      limit: parseInt(limite, 10),
      offset: parseInt(offset, 10),
      order: [['nombre', 'ASC']],
      paranoid: !incluirEliminados,
    });
    return {
      totalPermisos: count,
      permisos: rows,
      paginaActual: parseInt(pagina, 10),
      totalPaginas: Math.ceil(count / limite),
    };
  },

  async obtenerPermisoPorId(idPermiso, incluirEliminados = false) {
    return await db.Permiso.findByPk(idPermiso, { paranoid: !incluirEliminados });
  },

  async actualizarPermiso(idPermiso, datosActualizacion) {
    try {
      const permiso = await db.Permiso.findByPk(idPermiso);
      if (!permiso) {
        const error = new Error('Permiso no encontrado.'); error.status = 404; throw error;
      }
      if (datosActualizacion.nombre && datosActualizacion.nombre !== permiso.nombre) {
        const existente = await db.Permiso.findOne({
          where: { nombre: datosActualizacion.nombre, id_permiso: { [Op.ne]: idPermiso } },
          paranoid: false,
        });
        if (existente) {
            if (existente.fecha_eliminacion) {
                 const error = new Error(`Ya existe un permiso con el nombre '${datosActualizacion.nombre}' pero está eliminado.`);
                 error.status = 409; throw error;
            } else {
                 const error = new Error('Ya existe otro permiso con ese nombre.');
                 error.status = 409; throw error;
            }
        }
      }
      delete datosActualizacion.eliminado;
      delete datosActualizacion.fecha_eliminacion;
      await permiso.update(datosActualizacion);
      return permiso;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async eliminarPermiso(idPermiso) {
    try {
      const permiso = await db.Permiso.findByPk(idPermiso);
      if (!permiso) {
        const error = new Error('Permiso no encontrado o ya eliminado.'); error.status = 404; throw error;
      }
      // Opcional: Verificar si el permiso está asignado a algún Rol activo
      const rolesAsociados = await permiso.getRoles(); // Sequelize generará este método
      if (rolesAsociados && rolesAsociados.some(rol => !rol.fecha_eliminacion)) {
         const error = new Error('No se puede eliminar el permiso porque está asignado a uno o más roles activos.');
         error.status = 409;
         throw error;
      }
      await permiso.destroy();
      return true;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async restaurarPermiso(idPermiso) {
    try {
      const permiso = await db.Permiso.findByPk(idPermiso, { paranoid: false });
      if (!permiso) {
        const error = new Error('Permiso no encontrado.'); error.status = 404; throw error;
      }
      if (!permiso.fecha_eliminacion) {
        const error = new Error('El permiso no está eliminado.'); error.status = 400; throw error;
      }
      await permiso.restore();
      return permiso;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },
};
module.exports = permisoService;
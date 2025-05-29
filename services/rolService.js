const db = require('../models');
const { Op } = require('sequelize');

const rolService = {
  async crearRol(datosRol) {
    try {
      if (!datosRol.nombre) {
        const error = new Error('El nombre del rol es obligatorio.');
        error.status = 400;
        throw error;
      }
      // Verificar si ya existe, incluyendo los eliminados lógicamente para evitar duplicados
      const existente = await db.Rol.findOne({
        where: { nombre: datosRol.nombre },
        paranoid: false, // Incluir los eliminados lógicamente en la búsqueda
      });

      if (existente) {
        if (existente.fecha_eliminacion) { // O existente.eliminado === true
          const error = new Error(`Ya existe un rol con el nombre '${datosRol.nombre}' pero está eliminado. Considere restaurarlo.`);
          error.status = 409;
          throw error;
        } else {
          const error = new Error('Ya existe un rol con ese nombre.');
          error.status = 409;
          throw error;
        }
      }
      // Por defecto 'eliminado' será false y 'fecha_eliminacion' null
      const nuevoRol = await db.Rol.create(datosRol);
      return nuevoRol;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerTodosLosRoles(filtros = {}) {
    const { limite = 10, pagina = 1, nombre, incluirEliminados = false } = filtros;
    const offset = (pagina - 1) * limite;
    const whereClause = {};
    if (nombre) {
      whereClause.nombre = { [Op.like]: `%${nombre}%` };
    }

    const { count, rows } = await db.Rol.findAndCountAll({
      where: whereClause,
      limit: parseInt(limite, 10),
      offset: parseInt(offset, 10),
      order: [['nombre', 'ASC']],
      paranoid: !incluirEliminados, // Si no se incluyen eliminados, paranoid es true (comportamiento por defecto)
    });
    return {
      totalRoles: count,
      roles: rows,
      paginaActual: parseInt(pagina, 10),
      totalPaginas: Math.ceil(count / limite),
    };
  },

  async obtenerRolPorId(idRol, incluirEliminados = false) {
    return await db.Rol.findByPk(idRol, {
      include: [{
        model: db.Permiso,
        attributes: ['id_permiso', 'nombre'],
        through: { attributes: [] } // No traer atributos de la tabla de unión
      }],
      paranoid: !incluirEliminados,
    });
  },

  async actualizarRol(idRol, datosActualizacion) {
    try {
      const rol = await db.Rol.findByPk(idRol); // Por defecto, no encuentra los eliminados
      if (!rol) {
        const error = new Error('Rol no encontrado.');
        error.status = 404;
        throw error;
      }
      if (datosActualizacion.nombre && datosActualizacion.nombre !== rol.nombre) {
        const existente = await db.Rol.findOne({
          where: { nombre: datosActualizacion.nombre, id_rol: { [Op.ne]: idRol } },
          paranoid: false, // Chequear contra todos, incluso eliminados, para evitar duplicados futuros
        });
        if (existente) {
            if (existente.fecha_eliminacion) {
                 const error = new Error(`Ya existe un rol con el nombre '${datosActualizacion.nombre}' pero está eliminado.`);
                 error.status = 409; throw error;
            } else {
                 const error = new Error('Ya existe otro rol con ese nombre.');
                 error.status = 409; throw error;
            }
        }
      }
      // No se debería poder cambiar 'eliminado' o 'fecha_eliminacion' directamente aquí
      delete datosActualizacion.eliminado;
      delete datosActualizacion.fecha_eliminacion;

      await rol.update(datosActualizacion);
      return rol;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async eliminarRol(idRol) { // Eliminación lógica
    try {
      const rol = await db.Rol.findByPk(idRol);
      if (!rol) { // Ya no existe o ya está eliminado (paranoid=true por defecto en findByPk)
        const error = new Error('Rol no encontrado o ya eliminado.');
        error.status = 404;
        throw error;
      }
      // Opcional: Verificar dependencias (ej. si hay Usuarios con este rol)
      const usuariosAsociados = await db.Usuario.count({ where: { id_rol: idRol } }); // Asumiendo que Usuario no es paranoid o buscas activos
      if (usuariosAsociados > 0) {
        const error = new Error('No se puede eliminar el rol porque tiene usuarios asociados activos.');
        error.status = 409;
        throw error;
      }

      await rol.destroy(); // Esto activará el hook y seteará fecha_eliminacion y 'eliminado'
      return true;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async restaurarRol(idRol) {
    try {
      const rol = await db.Rol.findByPk(idRol, { paranoid: false }); // Buscar incluyendo eliminados
      if (!rol) {
        const error = new Error('Rol no encontrado.');
        error.status = 404;
        throw error;
      }
      if (!rol.fecha_eliminacion) { // O !rol.eliminado
        const error = new Error('El rol no está eliminado.');
        error.status = 400;
        throw error;
      }
      await rol.restore(); // Esto activará el hook y reseteará fecha_eliminacion y 'eliminado'
      return rol;
    } catch (error) {
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async asignarPermisosARol(idRol, idsPermisos) {
    const t = await db.sequelize.transaction();
    try {
      const rol = await db.Rol.findByPk(idRol, { transaction: t });
      if (!rol) {
        const error = new Error('Rol no encontrado.'); error.status = 404; throw error;
      }
      if (!Array.isArray(idsPermisos)) {
        const error = new Error('idsPermisos debe ser un array.'); error.status = 400; throw error;
      }

      // Verificar que todos los permisos existan
      if (idsPermisos.length > 0) {
        const permisosExistentes = await db.Permiso.findAll({
          where: { id_permiso: { [Op.in]: idsPermisos } },
          attributes: ['id_permiso'],
          transaction: t,
        });
        if (permisosExistentes.length !== idsPermisos.length) {
          const error = new Error('Uno o más IDs de permisos no son válidos.'); error.status = 400; throw error;
        }
      }

      // setPermisos reemplazará todos los permisos existentes por los nuevos.
      // Sequelize maneja la creación/eliminación en la tabla RolPermiso.
      await rol.setPermisos(idsPermisos.length > 0 ? idsPermisos : null, { transaction: t });

      await t.commit();
      // Devolver el rol con los permisos actualizados
      return await db.Rol.findByPk(idRol, {
        include: [{ model: db.Permiso, attributes: ['id_permiso', 'nombre'], through: { attributes: [] } }],
      });
    } catch (error) {
      await t.rollback();
      if (!error.status) error.status = 500;
      throw error;
    }
  },
};
module.exports = rolService;
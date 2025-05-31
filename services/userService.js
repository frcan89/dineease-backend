// services/userService.js
const db = require('../models');
const { Op } = require('sequelize');

const userService = {
  async crearUsuario(datosUsuario) {
    const t = await db.sequelize.transaction();
    try {
      const { email, password_hash, nombre, id_rol, id_restaurante, ...perfilData } = datosUsuario;

      if (!email || !password_hash || !nombre || !id_rol ) { // id_restaurante puede ser null
        const error = new Error('Faltan campos obligatorios (email, password, nombre, rol).');
        error.status = 400;
        throw error;
      }

      const usuarioExistente = await db.Usuario.findOne({
        where: { email },
        paranoid: false, // Comprobar incluso entre los eliminados
        transaction: t,
      });

      if (usuarioExistente) {
        if (usuarioExistente.fecha_eliminacion) { // O usuarioExistente.eliminado
          const error = new Error(`El correo electrónico '${email}' ya está registrado pero el usuario está eliminado. Considere restaurarlo.`);
          error.status = 409; throw error;
        } else {
          const error = new Error('El correo electrónico ya está registrado.');
          error.status = 409; throw error;
        }
      }

      // El hook 'beforeSave' en el modelo Usuario se encarga del hashing de password_hash
      const nuevoUsuario = await db.Usuario.create({
        email, password_hash, nombre, id_rol, id_restaurante,
        estado: true, // Por defecto activo y no eliminado
        eliminado: false
      }, { transaction: t });

      // Crear PerfilUsuario si hay datos para ello
      if (Object.keys(perfilData).length > 0 && (perfilData.direccion || perfilData.telefono || perfilData.documento_identidad || perfilData.notas)) {
        await db.PerfilUsuario.create({
          ...perfilData,
          id_usuario: nuevoUsuario.id_usuario,
          eliminado: false
        }, { transaction: t });
      }

      await t.commit();

      // No devolver la contraseña
      const { password_hash: _, ...usuarioSinPassword } = nuevoUsuario.get({ plain: true });
      // Cargar el perfil recién creado para devolverlo
      const perfil = await db.PerfilUsuario.findOne({where: {id_usuario: nuevoUsuario.id_usuario}, attributes: {exclude: ['id_usuario', 'eliminado', 'fecha_eliminacion', 'fecha_creacion', 'fecha_actualizacion']}})
      return { ...usuarioSinPassword, perfil: perfil ? perfil.get({plain: true}) : null };
    } catch (error) {
      await t.rollback();
      console.error('Error al crear usuario en el servicio:', error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async obtenerUsuarioPorId(userId, incluirEliminados = false) {
    try {
      const usuario = await db.Usuario.findByPk(userId, {
        attributes: { exclude: ['password_hash'] },
        include: [
          { model: db.Rol, attributes: ['id_rol', 'nombre'] },
          { model: db.PerfilUsuario, as: 'perfil', attributes: { exclude: ['id_usuario', 'eliminado', 'fecha_eliminacion'] } },
          { model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] } // Ajusta 'idRestaurante' si es 'id_restaurante'
        ],
        paranoid: !incluirEliminados,
      });
      return usuario;
    } catch (error) { /* ... manejo de error ... */ throw error; }
  },

  async obtenerUsuarioPorEmailConPassword(email) { // Para login
    try {
      // Login solo debe funcionar para usuarios no eliminados (paranoid: true por defecto) y activos
      const usuario = await db.Usuario.findOne({
        where: { email, estado: true }, // Asegurar que esté activo
        include: [
          { model: db.Rol, attributes: ['id_rol', 'nombre'] },
          { model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] } // Ajusta key
        ]
      });
      return usuario;
    } catch (error) { /* ... manejo de error ... */ throw error; }
  },

  async obtenerTodosLosUsuarios(filtros = {}) {
    try {
      const { limite = 10, pagina = 1, id_restaurante, id_rol, estado, nombre, incluirEliminados = false } = filtros;
      const offset = (pagina - 1) * limite;
      const whereClause = {};

      if (id_restaurante) whereClause.id_restaurante = id_restaurante;
      if (id_rol) whereClause.id_rol = id_rol;
      if (estado !== undefined) whereClause.estado = estado; // true o false
      if (nombre) whereClause.nombre = { [Op.like]: `%${nombre}%` };


      const { count, rows } = await db.Usuario.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password_hash'] },
        include: [
            { model: db.Rol, attributes: ['id_rol', 'nombre'] },
            { model: db.PerfilUsuario, as: 'perfil', attributes: { exclude: ['id_usuario', 'eliminado', 'fecha_eliminacion'] } },
            { model: db.Restaurante, attributes: ['idRestaurante', 'nombre'] } // Ajusta key
        ],
        limit: parseInt(limite, 10),
        offset: parseInt(offset, 10),
        order: [['nombre', 'ASC']],
        paranoid: !incluirEliminados,
      });
      return { /* ... resultado paginado ... */ };
    } catch (error) { /* ... manejo de error ... */ throw error; }
  },

  async actualizarUsuario(userId, datosActualizacion) {
    const t = await db.sequelize.transaction();
    try {
      const { email, nombre, id_rol, id_restaurante, estado, ...perfilData } = datosActualizacion;

      const usuario = await db.Usuario.findByPk(userId, { transaction: t });
      if (!usuario) {
        const error = new Error('Usuario no encontrado.'); error.status = 404; throw error;
      }

      if (email && email !== usuario.email) {
        const emailExistente = await db.Usuario.findOne({ where: { email, id_usuario: {[Op.ne]: userId} }, paranoid:false, transaction: t });
        if (emailExistente) {
            const msg = emailExistente.fecha_eliminacion ? `El nuevo correo electrónico ya está registrado por un usuario eliminado. Considere restaurarlo.` : 'El nuevo correo electrónico ya está registrado por otro usuario.';
            const error = new Error(msg); error.status = 409; throw error;
        }
      }

      // Campos a actualizar en Usuario
      const updatesUsuario = {};
      if (nombre !== undefined) updatesUsuario.nombre = nombre;
      if (email !== undefined) updatesUsuario.email = email;
      if (id_rol !== undefined) updatesUsuario.id_rol = id_rol;
      if (id_restaurante !== undefined) updatesUsuario.id_restaurante = id_restaurante;
      if (estado !== undefined) updatesUsuario.estado = estado;
      // No permitir actualizar password_hash, eliminado, fecha_eliminacion directamente aquí

      if (Object.keys(updatesUsuario).length > 0) {
        await usuario.update(updatesUsuario, { transaction: t });
      }

      // Actualizar PerfilUsuario
      if (Object.keys(perfilData).length > 0) {
        let perfil = await db.PerfilUsuario.findOne({ where: { id_usuario: userId }, transaction: t, paranoid: false });
        if (perfil) {
          await perfil.update(perfilData, { transaction: t });
        } else if (perfilData.direccion || perfilData.telefono || perfilData.documento_identidad || perfilData.notas) { // Solo crear si hay datos
          await db.PerfilUsuario.create({ ...perfilData, id_usuario: userId, eliminado: false }, { transaction: t });
        }
      }

      await t.commit();
      return await this.obtenerUsuarioPorId(userId); // Devolver el usuario con su perfil actualizado
    } catch (error) {
      await t.rollback();
      console.error('Error al actualizar usuario en el servicio:', error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async cambiarPassword(userId, passwordActual, nuevaPassword) {
    try {
        const usuario = await db.Usuario.findByPk(userId); // Necesitamos el hash actual
        if (!usuario) {
            const error = new Error('Usuario no encontrado.'); error.status = 404; throw error;
        }
        if (!usuario.estado || usuario.eliminado) {
            const error = new Error('Usuario inactivo o eliminado.'); error.status = 403; throw error;
        }

        const esPasswordValido = await usuario.validarPassword(passwordActual);
        if (!esPasswordValido) {
            const error = new Error('La contraseña actual es incorrecta.'); error.status = 401; throw error;
        }

        // El hook 'beforeSave' hasheará la nuevaPassword
        await usuario.update({ password_hash: nuevaPassword });
        return true;
    } catch (error) {
        console.error('Error al cambiar password:', error.message);
        if (!error.status) error.status = 500;
        throw error;
    }
  },


  async eliminarUsuario(userId) { // Eliminación lógica
    const t = await db.sequelize.transaction();
    try {
      const usuario = await db.Usuario.findByPk(userId, { transaction: t }); // No incluir eliminados por defecto
      if (!usuario) {
        const error = new Error('Usuario no encontrado o ya eliminado.'); error.status = 404; throw error;
      }
      // Opcional: Lógica adicional antes de eliminar (ej. no eliminar el último admin)

      // Eliminar lógicamente el perfil asociado también si existe
      const perfil = await db.PerfilUsuario.findOne({ where: { id_usuario: userId }, transaction: t });
      if (perfil) {
        await perfil.destroy({ transaction: t }); // Esto usará paranoid y activará el hook de PerfilUsuario
      }

      await usuario.destroy({ transaction: t }); // Esto usará paranoid y activará el hook de Usuario

      await t.commit();
      return true;
    } catch (error) {
      await t.rollback();
      console.error('Error al eliminar usuario:', error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },

  async restaurarUsuario(userId) {
    const t = await db.sequelize.transaction();
    try {
      const usuario = await db.Usuario.findByPk(userId, { paranoid: false, transaction: t }); // Buscar incluyendo eliminados
      if (!usuario) {
        const error = new Error('Usuario no encontrado.'); error.status = 404; throw error;
      }
      if (!usuario.fecha_eliminacion) { // O !usuario.eliminado
        const error = new Error('El usuario no está eliminado.'); error.status = 400; throw error;
      }

      await usuario.restore({ transaction: t }); // Restaura Usuario (activa hook)

      // Restaurar el perfil asociado también si existe y estaba eliminado
      const perfil = await db.PerfilUsuario.findOne({ where: { id_usuario: userId }, paranoid: false, transaction: t });
      if (perfil && perfil.fecha_eliminacion) { // O perfil.eliminado
        await perfil.restore({ transaction: t }); // Restaura PerfilUsuario (activa hook)
      }
      // Considerar poner estado a true también, si es que eliminar lo pone a false
      if (!usuario.estado) {
          await usuario.update({ estado: true }, { transaction: t });
      }


      await t.commit();
      return await this.obtenerUsuarioPorId(userId);
    } catch (error) {
      await t.rollback();
      console.error('Error al restaurar usuario:', error.message);
      if (!error.status) error.status = 500;
      throw error;
    }
  },
};
module.exports = userService;
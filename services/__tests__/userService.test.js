// services/__tests__/userService.test.js

const mockUsuarioInstance = {
  update: jest.fn(),
  destroy: jest.fn(),
  restore: jest.fn(),
  validarPassword: jest.fn(),
};
const mockPerfilUsuarioInstance = {
  update: jest.fn(),
  destroy: jest.fn(),
  restore: jest.fn(),
};

const mockUsuarioModel = { create: jest.fn(), findByPk: jest.fn(), findOne: jest.fn(), findAndCountAll: jest.fn() };
const mockPerfilUsuarioModel = { create: jest.fn(), findOne: jest.fn() };
const mockRolModel = { /* ...si es necesario para includes ... */ };
const mockRestauranteModel = { /* ... si es necesario para includes ... */ };

const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../models', () => ({
  Usuario: mockUsuarioModel,
  PerfilUsuario: mockPerfilUsuarioModel,
  Rol: mockRolModel,
  Restaurante: mockRestauranteModel,
  sequelize: {
    transaction: jest.fn(() => Promise.resolve(mockTransaction)),
  },
  Op: { like: Symbol.for('like'), ne: Symbol.for('ne'), in: Symbol.for('in') }
}));

const userService = require('../userService');
const db = require('../../models');

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- Pruebas para crearUsuario ---
  describe('crearUsuario', () => {
    it('debería crear un usuario y su perfil exitosamente', async () => {
      const datosUsuario = {
        email: 'test@example.com', password_hash: 'rawpass', nombre: 'Test User', id_rol: 1, id_restaurante: 1,
        direccion: 'Calle Falsa 123', telefono: '555-1234' // Datos para PerfilUsuario
      };
      const usuarioCreadoMock = { id_usuario: 1, email: 'test@example.com', nombre: 'Test User', get: jest.fn(function() { return this; }) };
      const perfilCreadoMock = { id_perfil_usuario: 1, id_usuario: 1, direccion: 'Calle Falsa 123', get: jest.fn(function() { return this; }) };

      db.Usuario.findOne.mockResolvedValue(null); // No existe
      db.Usuario.create.mockResolvedValue(usuarioCreadoMock);
      db.PerfilUsuario.create.mockResolvedValue(perfilCreadoMock);
      // Mock para la carga final del perfil
      db.PerfilUsuario.findOne.mockResolvedValue(perfilCreadoMock);


      const resultado = await userService.crearUsuario(datosUsuario);

      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(db.Usuario.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: datosUsuario.email, nombre: datosUsuario.nombre }),
        { transaction: mockTransaction }
      );
      expect(db.PerfilUsuario.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_usuario: usuarioCreadoMock.id_usuario, direccion: datosUsuario.direccion }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(resultado.email).toBe(datosUsuario.email);
      expect(resultado.perfil.direccion).toBe(datosUsuario.direccion);
    });

    it('debería crear un usuario sin perfil si no se proporcionan datos de perfil', async () => {
        const datosUsuario = { email: 'test2@example.com', password_hash: 'rawpass2', nombre: 'Test User 2', id_rol: 1 };
        const usuarioCreadoMock = { id_usuario: 2, email: 'test2@example.com', get: jest.fn(function() { return this; }) };

        db.Usuario.findOne.mockResolvedValue(null);
        db.Usuario.create.mockResolvedValue(usuarioCreadoMock);
        db.PerfilUsuario.findOne.mockResolvedValue(null); // No se encontró/creó perfil

        const resultado = await userService.crearUsuario(datosUsuario);

        expect(db.Usuario.create).toHaveBeenCalled();
        expect(db.PerfilUsuario.create).not.toHaveBeenCalled(); // No se llama si no hay datos
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(resultado.email).toBe(datosUsuario.email);
        expect(resultado.perfil).toBeNull();
    });
    // ... casos de error para crearUsuario (email duplicado, email duplicado pero eliminado, campos faltantes) ...
  });

  // --- Pruebas para obtenerUsuarioPorId ---
  describe('obtenerUsuarioPorId', () => {
    it('debería devolver un usuario con su rol, perfil y restaurante', async () => {
      const mockUsuario = { id_usuario: 1, nombre: 'Usuario Encontrado', password_hash: 'hashed' };
      db.Usuario.findByPk.mockResolvedValue(mockUsuario);

      const resultado = await userService.obtenerUsuarioPorId(1);
      expect(db.Usuario.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({
        attributes: { exclude: ['password_hash'] },
        include: expect.any(Array),
        paranoid: true
      }));
      expect(resultado).toEqual(mockUsuario);
    });
  });

  // --- Pruebas para actualizarUsuario ---
  describe('actualizarUsuario', () => {
    it('debería actualizar un usuario y su perfil', async () => {
      const mockInstanciaUsuario = {
          ...mockUsuarioInstance, id_usuario: 1, email: 'old@example.com',
          update: jest.fn().mockResolvedValue(undefined)
      };
      const mockInstanciaPerfil = {
          ...mockPerfilUsuarioInstance, id_usuario: 1, direccion: 'Vieja Dir',
          update: jest.fn().mockResolvedValue(undefined)
      };
      db.Usuario.findByPk.mockResolvedValue(mockInstanciaUsuario);
      db.PerfilUsuario.findOne.mockResolvedValue(mockInstanciaPerfil);
      db.Usuario.findOne.mockResolvedValue(null); // Para la verificación de email duplicado

      // Mock para el findByPk final
      const usuarioActualizadoConPerfil = { ...mockInstanciaUsuario, email: 'new@example.com', perfil: {...mockInstanciaPerfil, direccion: 'Nueva Dir'} };
      jest.spyOn(userService, 'obtenerUsuarioPorId').mockResolvedValue(usuarioActualizadoConPerfil);


      const datosActualizacion = { email: 'new@example.com', direccion: 'Nueva Dir' };
      const resultado = await userService.actualizarUsuario(1, datosActualizacion);

      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(mockInstanciaUsuario.update).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@example.com' }), { transaction: mockTransaction });
      expect(mockInstanciaPerfil.update).toHaveBeenCalledWith(expect.objectContaining({ direccion: 'Nueva Dir' }), { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(resultado.email).toBe('new@example.com');
      expect(resultado.perfil.direccion).toBe('Nueva Dir');

      userService.obtenerUsuarioPorId.mockRestore(); // Restaurar el mock de obtenerUsuarioPorId
    });

    it('debería crear un perfil si no existe al actualizar usuario con datos de perfil', async () => {
        const mockInstanciaUsuario = { ...mockUsuarioInstance, id_usuario: 1, update: jest.fn() };
        db.Usuario.findByPk.mockResolvedValue(mockInstanciaUsuario);
        db.PerfilUsuario.findOne.mockResolvedValue(null); // Perfil no existe
        db.PerfilUsuario.create.mockResolvedValue({ id_perfil_usuario: 1, id_usuario: 1, telefono: '123' });
         // Mock para el findByPk final
        jest.spyOn(userService, 'obtenerUsuarioPorId').mockResolvedValue({...mockInstanciaUsuario, perfil: {telefono: '123'}});


        const datosActualizacion = { telefono: '123' };
        await userService.actualizarUsuario(1, datosActualizacion);

        expect(db.PerfilUsuario.create).toHaveBeenCalledWith(expect.objectContaining({ id_usuario: 1, telefono: '123' }), { transaction: mockTransaction });
        expect(mockTransaction.commit).toHaveBeenCalled();
        userService.obtenerUsuarioPorId.mockRestore();
    });
    // ... más casos para actualizar (usuario no encontrado, email duplicado) ...
  });


  // --- Pruebas para cambiarPassword ---
  describe('cambiarPassword', () => {
    it('debería cambiar la contraseña si la actual es correcta', async () => {
        const mockInstanciaUsuario = {
            ...mockUsuarioInstance, id_usuario: 1, estado: true, eliminado: false,
            validarPassword: jest.fn().mockResolvedValue(true), // Password actual es correcta
            update: jest.fn().mockResolvedValue(undefined)
        };
        db.Usuario.findByPk.mockResolvedValue(mockInstanciaUsuario);

        const resultado = await userService.cambiarPassword(1, 'passActual123', 'nuevaPass456');
        expect(mockInstanciaUsuario.validarPassword).toHaveBeenCalledWith('passActual123');
        expect(mockInstanciaUsuario.update).toHaveBeenCalledWith({ password_hash: 'nuevaPass456' });
        expect(resultado).toBe(true);
    });
    // ... casos de error para cambiarPassword (usuario no encontrado, pass actual incorrecta) ...
  });

  // --- Pruebas para eliminarUsuario ---
  describe('eliminarUsuario', () => {
    it('debería eliminar lógicamente un usuario y su perfil', async () => {
      const mockInstanciaUsuarioConDestroy = { ...mockUsuarioInstance, id_usuario: 1, destroy: jest.fn().mockResolvedValue(true) };
      const mockInstanciaPerfilConDestroy = { ...mockPerfilUsuarioInstance, id_usuario: 1, destroy: jest.fn().mockResolvedValue(true) };

      db.Usuario.findByPk.mockResolvedValue(mockInstanciaUsuarioConDestroy);
      db.PerfilUsuario.findOne.mockResolvedValue(mockInstanciaPerfilConDestroy);

      const resultado = await userService.eliminarUsuario(1);

      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(mockInstanciaPerfilConDestroy.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockInstanciaUsuarioConDestroy.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(resultado).toBe(true);
    });
    // ... más casos para eliminar (usuario no encontrado, perfil no encontrado pero usuario sí)
  });

  // --- Pruebas para restaurarUsuario ---
  describe('restaurarUsuario', () => {
    it('debería restaurar un usuario y su perfil eliminado lógicamente', async () => {
      const mockInstanciaUsuarioConRestore = {
          ...mockUsuarioInstance, id_usuario: 1, fecha_eliminacion: new Date(), estado: false,
          restore: jest.fn().mockResolvedValue(undefined),
          update: jest.fn().mockResolvedValue(undefined) // Para actualizar el estado
      };
      const mockInstanciaPerfilConRestore = {
          ...mockPerfilUsuarioInstance, id_usuario: 1, fecha_eliminacion: new Date(),
          restore: jest.fn().mockResolvedValue(undefined)
      };

      db.Usuario.findByPk.mockResolvedValue(mockInstanciaUsuarioConRestore);
      db.PerfilUsuario.findOne.mockResolvedValue(mockInstanciaPerfilConRestore);
       // Mock para el findByPk final
      jest.spyOn(userService, 'obtenerUsuarioPorId').mockResolvedValue({...mockInstanciaUsuarioConRestore, estado: true, fecha_eliminacion: null, perfil: {...mockInstanciaPerfilConRestore, fecha_eliminacion: null}});


      const resultado = await userService.restaurarUsuario(1);

      expect(db.sequelize.transaction).toHaveBeenCalled();
      expect(db.Usuario.findByPk).toHaveBeenCalledWith(1, { paranoid: false, transaction: mockTransaction });
      expect(mockInstanciaUsuarioConRestore.restore).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockInstanciaUsuarioConRestore.update).toHaveBeenCalledWith({ estado: true }, {transaction: mockTransaction});
      expect(db.PerfilUsuario.findOne).toHaveBeenCalledWith({ where: { id_usuario: 1 }, paranoid: false, transaction: mockTransaction });
      expect(mockInstanciaPerfilConRestore.restore).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(resultado.estado).toBe(true);

      userService.obtenerUsuarioPorId.mockRestore();
    });
    // ... más casos para restaurar (usuario no encontrado, usuario no eliminado, perfil no eliminado)
  });

});
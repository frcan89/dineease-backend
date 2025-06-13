const inventarioService = require('../inventarioService');
const { Inventario, Producto } = require('../../models'); // Ajusta la ruta según tu estructura

// Mock de los modelos
jest.mock('../../models', () => ({
  Inventario: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sequelize: { Op: { ne: Symbol('ne') } }, // Mock Op.ne para la lógica de actualizarInventario
  },
  Producto: {
    findByPk: jest.fn(),
  },
  // Asegúrate de que sequelize sea también mockeado si es usado directamente por el servicio,
  // aunque aquí no parece ser el caso más allá de Op.ne.
  sequelize: jest.fn(),
}));

describe('InventarioService', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  // Pruebas para crearInventario
  describe('crearInventario', () => {
    const datosInventario = {
      idProducto: 1,
      cantidad: 10,
      ubicacion: 'Estante A',
      proveedor: 'Proveedor X',
      precio_compra: 20.5,
      fecha_adquisicion: new Date().toISOString(),
    };
    const mockProducto = { idProducto: 1, nombre: 'Producto Test' };
    const mockInventarioCreado = { ...datosInventario, idInventario: 1, ultima_actualizacion: new Date() };

    it('debería crear un item de inventario exitosamente', async () => {
      Producto.findByPk.mockResolvedValue(mockProducto);
      Inventario.findOne.mockResolvedValue(null); // No existe inventario para este producto
      Inventario.create.mockResolvedValue(mockInventarioCreado);

      const resultado = await inventarioService.crearInventario(datosInventario);
      expect(Producto.findByPk).toHaveBeenCalledWith(datosInventario.idProducto);
      expect(Inventario.findOne).toHaveBeenCalledWith({ where: { idProducto: datosInventario.idProducto } });
      expect(Inventario.create).toHaveBeenCalledWith(expect.objectContaining({
        ...datosInventario,
        ultima_actualizacion: expect.any(Date),
      }));
      expect(resultado).toEqual(mockInventarioCreado);
    });

    it('debería lanzar un error si idProducto no se proporciona', async () => {
      await expect(inventarioService.crearInventario({ ...datosInventario, idProducto: undefined }))
        .rejects.toThrowError('El campo idProducto es obligatorio.');
    });

    it('debería lanzar un error si el Producto no existe', async () => {
      Producto.findByPk.mockResolvedValue(null);
      await expect(inventarioService.crearInventario(datosInventario))
        .rejects.toThrowError(`El producto con ID ${datosInventario.idProducto} no existe.`);
    });

    it('debería lanzar un error si ya existe inventario para el idProducto', async () => {
      Producto.findByPk.mockResolvedValue(mockProducto);
      Inventario.findOne.mockResolvedValue({ idInventario: 2, idProducto: datosInventario.idProducto }); // Ya existe
      await expect(inventarioService.crearInventario(datosInventario))
        .rejects.toThrowError(`Ya existe un inventario para el producto con ID ${datosInventario.idProducto}.`);
    });

    it('debería lanzar un error si Inventario.create falla', async () => {
      Producto.findByPk.mockResolvedValue(mockProducto);
      Inventario.findOne.mockResolvedValue(null);
      Inventario.create.mockRejectedValue(new Error('Error de base de datos'));
      await expect(inventarioService.crearInventario(datosInventario))
        .rejects.toThrowError('Error al crear el inventario: Error de base de datos');
    });
  });

  // Pruebas para obtenerTodosLosInventarios
  describe('obtenerTodosLosInventarios', () => {
    const mockInventarios = {
      count: 2,
      rows: [
        { idInventario: 1, idProducto: 1, cantidad: 10, producto: { idProducto: 1, nombre: 'P1'} },
        { idInventario: 2, idProducto: 2, cantidad: 5, producto: { idProducto: 2, nombre: 'P2'} },
      ],
    };

    it('debería obtener todos los items de inventario con opciones por defecto', async () => {
      Inventario.findAndCountAll.mockResolvedValue(mockInventarios);
      const resultado = await inventarioService.obtenerTodosLosInventarios({});
      expect(Inventario.findAndCountAll).toHaveBeenCalledWith({
        include: [{ model: Producto, as: 'producto' }],
        where: {},
      });
      expect(resultado).toEqual(mockInventarios);
    });

    it('debería aplicar paginación correctamente', async () => {
      Inventario.findAndCountAll.mockResolvedValue(mockInventarios);
      const filtros = { limite: '5', pagina: '2' };
      await inventarioService.obtenerTodosLosInventarios(filtros);
      expect(Inventario.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        limit: 5,
        offset: 5, // (2-1)*5
      }));
    });

    it('debería aplicar filtro por idProducto correctamente', async () => {
      Inventario.findAndCountAll.mockResolvedValue(mockInventarios);
      const filtros = { idProducto: '1' };
      await inventarioService.obtenerTodosLosInventarios(filtros);
      expect(Inventario.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { idProducto: '1' },
      }));
    });

    it('debería lanzar un error si Inventario.findAndCountAll falla', async () => {
      Inventario.findAndCountAll.mockRejectedValue(new Error('Error de BD'));
      await expect(inventarioService.obtenerTodosLosInventarios({}))
        .rejects.toThrowError('Error al obtener los inventarios: Error de BD');
    });
  });

  // Pruebas para obtenerInventarioPorId
  describe('obtenerInventarioPorId', () => {
    const mockInventario = { idInventario: 1, idProducto: 1, cantidad: 10 };

    it('debería obtener un item de inventario por su ID', async () => {
      Inventario.findByPk.mockResolvedValue(mockInventario);
      const resultado = await inventarioService.obtenerInventarioPorId(1);
      expect(Inventario.findByPk).toHaveBeenCalledWith(1, {
        include: [{ model: Producto, as: 'producto' }],
      });
      expect(resultado).toEqual(mockInventario);
    });

    it('debería lanzar un error si el item no se encuentra', async () => {
      Inventario.findByPk.mockResolvedValue(null);
      await expect(inventarioService.obtenerInventarioPorId(99))
        .rejects.toThrowError('Inventario con ID 99 no encontrado.');
    });

    it('debería lanzar un error si Inventario.findByPk falla', async () => {
      Inventario.findByPk.mockRejectedValue(new Error('Error DB'));
      await expect(inventarioService.obtenerInventarioPorId(1))
        .rejects.toThrowError('Error al obtener el inventario por ID: Error DB');
    });
  });

  // Pruebas para obtenerInventarioPorIdProducto
  describe('obtenerInventarioPorIdProducto', () => {
    const mockInventario = { idInventario: 1, idProducto: 1, cantidad: 10 };

    it('debería obtener un item de inventario por idProducto', async () => {
      Inventario.findOne.mockResolvedValue(mockInventario);
      const resultado = await inventarioService.obtenerInventarioPorIdProducto(1);
      expect(Inventario.findOne).toHaveBeenCalledWith({
        where: { idProducto: 1 },
        include: [{ model: Producto, as: 'producto' }],
      });
      expect(resultado).toEqual(mockInventario);
    });

    it('debería lanzar un error si idProducto no se proporciona', async () => {
        await expect(inventarioService.obtenerInventarioPorIdProducto(undefined))
          .rejects.toThrowError('El parámetro idProducto es obligatorio.');
      });

    it('debería lanzar un error si el item no se encuentra para el idProducto', async () => {
      Inventario.findOne.mockResolvedValue(null);
      await expect(inventarioService.obtenerInventarioPorIdProducto(99))
        .rejects.toThrowError('Inventario para el producto con ID 99 no encontrado.');
    });

    it('debería lanzar un error si Inventario.findOne falla', async () => {
        Inventario.findOne.mockRejectedValue(new Error('Error DB findOne'));
        await expect(inventarioService.obtenerInventarioPorIdProducto(1))
          .rejects.toThrowError('Error al obtener el inventario por ID de producto: Error DB findOne');
      });
  });

  // Pruebas para actualizarInventario
  describe('actualizarInventario', () => {
    const idInventario = 1;
    const datosActualizacion = { cantidad: 20, ubicacion: 'Estante B' };
    const mockInventarioExistente = {
      idInventario,
      idProducto: 1,
      cantidad: 10,
      ubicacion: 'Estante A',
      update: jest.fn(), // Mock para la instancia
    };
    // La función findByPk después de update debería devolver el item con sus asociaciones
    const mockInventarioActualizadoConProducto = {
        ...mockInventarioExistente,
        ...datosActualizacion,
        ultima_actualizacion: expect.any(Date),
        producto: { idProducto: 1, nombre: 'Producto Test'}
    };


    beforeEach(() => {
        // Asegurarse que la instancia mockeada también limpie su mock de 'update'
        if(mockInventarioExistente.update.mockClear) {
            mockInventarioExistente.update.mockClear();
        }
        // Simular que después de update, findByPk devuelve el objeto "actualizado" con producto
        Inventario.findByPk.mockImplementation(async (id) => {
            if (id === idInventario) {
                // Si es el primer findByPk (antes del update)
                if (!mockInventarioExistente.update.mock.calls.length) {
                    return mockInventarioExistente;
                }
                // Si es el findByPk después del update (para retornar con producto)
                return mockInventarioActualizadoConProducto;
            }
            return null;
        });
    });


    it('debería actualizar un item de inventario exitosamente', async () => {
      mockInventarioExistente.update.mockResolvedValue(true); // Simula que el update en la instancia fue exitoso

      const resultado = await inventarioService.actualizarInventario(idInventario, datosActualizacion);

      expect(Inventario.findByPk).toHaveBeenCalledWith(idInventario); // Primera llamada para encontrarlo
      expect(mockInventarioExistente.update).toHaveBeenCalledWith(expect.objectContaining({
        ...datosActualizacion,
        ultima_actualizacion: expect.any(Date),
      }));
      expect(Inventario.findByPk).toHaveBeenCalledWith(idInventario, { // Segunda llamada para devolver con producto
        include: [{ model: Producto, as: 'producto' }],
      });
      expect(resultado).toEqual(mockInventarioActualizadoConProducto);
    });

    it('debería lanzar un error si el item a actualizar no se encuentra', async () => {
      Inventario.findByPk.mockResolvedValueOnce(null); // Solo la primera llamada devuelve null
      await expect(inventarioService.actualizarInventario(99, datosActualizacion))
        .rejects.toThrowError('Inventario con ID 99 no encontrado.');
    });

    it('debería lanzar un error si se actualiza idProducto y el nuevo Producto no existe', async () => {
      const datosConNuevoProducto = { ...datosActualizacion, idProducto: 2 };
      // Inventario.findByPk.mockResolvedValueOnce(mockInventarioExistente); // Ya configurado en beforeEach
      Producto.findByPk.mockResolvedValueOnce(null); // El nuevo producto no existe

      await expect(inventarioService.actualizarInventario(idInventario, datosConNuevoProducto))
        .rejects.toThrowError(`El producto con ID ${datosConNuevoProducto.idProducto} no existe.`);
      expect(Producto.findByPk).toHaveBeenCalledWith(datosConNuevoProducto.idProducto);
    });

    it('debería lanzar un error si se actualiza idProducto y ya existe inventario para el nuevo idProducto', async () => {
      const datosConNuevoProducto = { ...datosActualizacion, idProducto: 2 };
      // Inventario.findByPk.mockResolvedValueOnce(mockInventarioExistente); // Ya configurado en beforeEach
      Producto.findByPk.mockResolvedValueOnce({ idProducto: 2, nombre: 'Otro Producto' }); // El nuevo producto existe
      Inventario.findOne.mockResolvedValueOnce({ idInventario: 3, idProducto: 2 }); // Otro inventario ya usa el nuevo idProducto

      await expect(inventarioService.actualizarInventario(idInventario, datosConNuevoProducto))
        .rejects.toThrowError(`Ya existe un inventario para el producto con ID ${datosConNuevoProducto.idProducto}.`);
      expect(Inventario.findOne).toHaveBeenCalledWith({
        where: { idProducto: datosConNuevoProducto.idProducto, idInventario: { [Inventario.sequelize.Op.ne]: idInventario } },
      });
    });

    it('debería funcionar si se actualiza idProducto y no hay conflicto', async () => {
        const datosConNuevoProducto = { ...datosActualizacion, idProducto: 2 };
        const mockProductoNuevo = { idProducto: 2, nombre: 'Producto Nuevo' };
        // mockInventarioExistente.idProducto es 1
        // Inventario.findByPk.mockResolvedValueOnce(mockInventarioExistente); // En beforeEach
        Producto.findByPk.mockResolvedValueOnce(mockProductoNuevo); // Nuevo producto existe
        Inventario.findOne.mockResolvedValueOnce(null); // No hay conflicto con nuevo idProducto
        mockInventarioExistente.update.mockResolvedValue(true);

        // Modificar el mockInventarioActualizadoConProducto para el findByPk final
        const mockInventarioFinalConNuevoProducto = {
            ...mockInventarioExistente,
            ...datosConNuevoProducto,
            ultima_actualizacion: expect.any(Date),
            producto: mockProductoNuevo
        };
        // Sobrescribir el mock de findByPk para la segunda llamada
        Inventario.findByPk.mockImplementationOnce(async (id) => id === idInventario ? mockInventarioExistente : null) // primera llamada
                           .mockImplementationOnce(async (id) => id === idInventario ? mockInventarioFinalConNuevoProducto : null); // segunda llamada


        const resultado = await inventarioService.actualizarInventario(idInventario, datosConNuevoProducto);
        expect(mockInventarioExistente.update).toHaveBeenCalledWith(expect.objectContaining({
            ...datosConNuevoProducto,
            ultima_actualizacion: expect.any(Date),
        }));
        expect(resultado.idProducto).toBe(2);
        expect(resultado.producto).toEqual(mockProductoNuevo);
    });


    it('debería lanzar un error si Inventario.update falla', async () => {
      // Inventario.findByPk.mockResolvedValueOnce(mockInventarioExistente); // En beforeEach
      mockInventarioExistente.update.mockRejectedValue(new Error('Error de BD al actualizar'));
      await expect(inventarioService.actualizarInventario(idInventario, datosActualizacion))
        .rejects.toThrowError('Error al actualizar el inventario: Error de BD al actualizar');
    });
  });

  // Pruebas para eliminarInventario
  describe('eliminarInventario', () => {
    const idInventario = 1;
    const mockInventarioParaEliminar = {
      idInventario,
      idProducto: 1,
      destroy: jest.fn(), // Mock para la instancia
    };

    it('debería eliminar un item de inventario exitosamente', async () => {
      Inventario.findByPk.mockResolvedValue(mockInventarioParaEliminar);
      mockInventarioParaEliminar.destroy.mockResolvedValue(true); // Simula que destroy en la instancia fue exitoso

      const resultado = await inventarioService.eliminarInventario(idInventario);
      expect(Inventario.findByPk).toHaveBeenCalledWith(idInventario);
      expect(mockInventarioParaEliminar.destroy).toHaveBeenCalled();
      expect(resultado).toEqual({ mensaje: `Inventario con ID ${idInventario} eliminado exitosamente.` });
    });

    it('debería lanzar un error si el item a eliminar no se encuentra', async () => {
      Inventario.findByPk.mockResolvedValue(null);
      await expect(inventarioService.eliminarInventario(99))
        .rejects.toThrowError('Inventario con ID 99 no encontrado.');
    });

    it('debería lanzar un error si Inventario.destroy falla', async () => {
      Inventario.findByPk.mockResolvedValue(mockInventarioParaEliminar);
      mockInventarioParaEliminar.destroy.mockRejectedValue(new Error('Error de BD al eliminar'));
      await expect(inventarioService.eliminarInventario(idInventario))
        .rejects.toThrowError('Error al eliminar el inventario: Error de BD al eliminar');
    });
  });
});

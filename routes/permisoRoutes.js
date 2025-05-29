const express = require('express');
const router = express.Router();
const permisoController = require('../controllers/permisoController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware');

router.use(authMiddleware.verificarToken); // Proteger todas las rutas de permisos

// CRUD para Permisos
router.post('/', /* authorizationMiddleware.permitir(['admin_sistema']), */ permisoController.handleCrearPermiso);
router.get('/', /* authorizationMiddleware.permitir(['admin_sistema', 'gerente']), */ permisoController.handleObtenerTodosLosPermisos);
router.get('/:id', /* authorizationMiddleware.permitir(['admin_sistema', 'gerente']), */ permisoController.handleObtenerPermisoPorId);
router.put('/:id', /* authorizationMiddleware.permitir(['admin_sistema']), */ permisoController.handleActualizarPermiso);
router.delete('/:id', /* authorizationMiddleware.permitir(['admin_sistema']), */ permisoController.handleEliminarPermiso);
router.put('/:id/restaurar', /* authorizationMiddleware.permitir(['admin_sistema']), */ permisoController.handleRestaurarPermiso);

module.exports = router;
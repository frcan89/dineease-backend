const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const authMiddleware = require('../middlewares/authMiddleware');
// const authorizationMiddleware = require('../middlewares/authorizationMiddleware'); // Para permisos

//router.use(authMiddleware.verificarToken); // Proteger todas las rutas de roles

// CRUD para Roles
router.post('/', /* authorizationMiddleware.permitir(['admin_sistema']), */ rolController.handleCrearRol);
router.get('/', /* authorizationMiddleware.permitir(['admin_sistema', 'gerente']), */ rolController.handleObtenerTodosLosRoles);
router.get('/:id', /* authorizationMiddleware.permitir(['admin_sistema', 'gerente']), */ rolController.handleObtenerRolPorId);
router.put('/:id', /* authorizationMiddleware.permitir(['admin_sistema']), */ rolController.handleActualizarRol);
router.delete('/:id', /* authorizationMiddleware.permitir(['admin_sistema']), */ rolController.handleEliminarRol);
router.put('/:id/restaurar', /* authorizationMiddleware.permitir(['admin_sistema']), */ rolController.handleRestaurarRol);

// Asignar permisos a un rol
router.put('/:id/permisos', /* authorizationMiddleware.permitir(['admin_sistema']), */ rolController.handleAsignarPermisosARol);

module.exports = router;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// CRUD de usuarios
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// CRUD de grados
router.post('/grades', adminController.createGrade);
router.put('/grades/:id', adminController.updateGrade);
router.delete('/grades/:id', adminController.deleteGrade);

// Vistas
router.get('/dashboard', adminController.renderDashboard);
router.get('/createUser', adminController.renderCreateUser); // Para el formulario de creación de usuario
router.get('/editUser/:id', adminController.renderEditUser); // Para el formulario de edición de usuario
router.get('/deleteUser/:id', adminController.deleteUser); // Para la eliminación de usuario
router.get('/createGrade', adminController.renderCreateGrade); // Para el formulario de creación de grado
router.get('/editGrade/:id', adminController.renderEditGrade); // Para el formulario de edición de grado
router.get('/deleteGrade/:id', adminController.deleteGrade); // Para la eliminación de grado

module.exports = router;

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Operaciones para estudiantes
router.get('/dashboard', studentController.getDashboard);
router.get('/modules/:id', studentController.getModulo);
router.get('/modules/:id/details', studentController.getDetallesModulo); // Nueva ruta para obtener los detalles del módulo
router.get('/quiz/:id', studentController.getQuizDetails);
// Ruta para enviar un intento de resolver el cuestionario
router.post('/submitAttempt', studentController.submitAttempt);
// Nueva ruta para ver los intentos de un cuestionario
router.get('/quiz/:id/attempts/:modulo', studentController.getQuizAttempts);

module.exports = router;

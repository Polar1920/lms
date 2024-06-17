const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

// CRUD de módulos
router.get('/modules', moduleController.getModules);
router.get('/modules/:id', moduleController.getModule);
router.post('/modules', moduleController.createModule);
router.put('/modules/:id', moduleController.updateModule);
router.delete('/modules/:id', moduleController.deleteModule);

module.exports = router;

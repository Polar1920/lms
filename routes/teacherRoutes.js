const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const upload = require('../middlewares/upload'); // Asegúrate de que la ruta es correcta

// Operaciones para profesores
router.get('/dashboard', teacherController.getDashboard);
router.get('/modules/create', teacherController.getCreateModuloForm);
router.post('/modules/create', upload.single('moduleImage'), teacherController.createModulo);
router.get('/modules/:id/edit', teacherController.getEditModuloForm);
router.get('/modules/:id/quizzes', teacherController.getEditModuloQuizzes);
router.post('/modules/:id/edit', upload.single('moduleImage'), teacherController.updateModulo);
router.post('/modules/:id/delete', teacherController.deleteModulo);
router.get('/modules/:id/quizzes', teacherController.getModuleQuizzes);
router.post('/modules/:id/manageGrades', teacherController.manageGrades); // Nueva ruta
router.post('/modules/:id/removeGrade', teacherController.removeGradeFromModule);
router.post('/modules/:id/removeQuiz', teacherController.removeQuizFromModule);
router.get('/modules/:id/grade/:gradeId', teacherController.getGradeDetails);
// Nueva ruta para obtener los detalles de las notas de los estudiantes
router.get('/gradeDetails/:gradoId/:modulo', teacherController.getGradeDetails);

router.post('/updateComment', teacherController.updateComment);

// Ruta para mostrar el formulario de creación de cuestionario
router.get('/modules/:id/createQuiz', (req, res) => {
    const moduloId = req.params.id;
    res.render('createQuiz', { moduloId });
});

// Ruta para manejar la creación de un cuestionario
router.post('/modules/:id/createQuiz', upload.single('quizImage'), teacherController.createQuiz);

// Routes for quizzes
router.get('/quizzes/:id/details/:moduleId', teacherController.getQuizDetails);
router.get('/quizzes/:id/createQuestion/:moduleId', teacherController.getCreateQuestionForm);
router.post('/quizzes/:id/createQuestion', upload.single('questionImage'), teacherController.createQuestion);
router.get('/quizzes/:quizId/editQuestion/:questionId/:moduleId', teacherController.getEditQuestion);
router.post('/quizzes/:quizId/editQuestion/:questionId', upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'respuestas[0][imagen]', maxCount: 1 },
    { name: 'respuestas[1][imagen]', maxCount: 1 },
    // Agrega más campos según sea necesario
]), teacherController.postEditQuestion);
// Ruta para mostrar el formulario de edición del cuestionario
router.get('/quizzes/:quizId/edit', teacherController.getEditQuiz);

// Ruta para procesar la solicitud de edición del cuestionario
router.post('/quizzes/:quizId/edit', upload.single('quizImage'), teacherController.postEditQuiz);
router.put('/quizzes/:quizId/edit', upload.single('quizImage'), teacherController.postEditQuiz);

module.exports = router;

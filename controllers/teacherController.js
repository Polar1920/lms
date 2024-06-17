const Modulo = require('../models/moduleModel');
const Grado = require('../models/gradeModel');
const Usuario = require('../models/userModel');
const Cuestionario = require('../models/quizModel');
const Pregunta = require('../models/questionModel');
const Respuesta = require('../models/answerModel');
const Intento = require('../models/attemptModel');
const Intento_Respuesta = require('../models/attemptAnswerModel');
const Modulos_Grados = require('../models/Modulos_Grados');

exports.getDashboard = async (req, res) => {
    try {
        const modulos = await Modulo.findAll({ where: { profesor_id: req.session.user.id } });
        res.render('teacherDashboard', { modulos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCreateModuloForm = (req, res) => {
    res.render('createModulo');
};

exports.createModulo = async (req, res) => {
    try {
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const { nombre, descripcion } = req.body;
        const imagen = req.file ? `/uploads/modules/${req.file.filename}` : null;

        if (!nombre || !descripcion) {
            throw new Error('El nombre y la descripción son obligatorios.');
        }

        const modulo = await Modulo.create({
            nombre,
            descripcion,
            imagen,
            profesor_id: req.session.user.id
        });

        res.redirect('/teacher/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEditModuloForm = async (req, res) => {
    try {
        const modulo = await Modulo.findByPk(req.params.id, { include: Grado }); // Incluye los grados asociados al módulo
        if (modulo.profesor_id !== req.session.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para editar este módulo' });
        }
        // Obtiene los grados asociados al módulo
        const gradosAsociados = modulo.Grados;
        // Obtener todos los grados disponibles
        const gradosDisponibles = await Grado.findAll();
        // Obtener los cuestionarios asociados al módulo
        const cuestionarios = await Cuestionario.findAll({ where: { modulo_id: req.params.id } });

        res.render('editModulo', {
            modulo,
            gradosDisponibles,
            gradosAsociados,
            cuestionarios // Pasa los cuestionarios a la vista
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEditModuloQuizzes = async (req, res) => {
    try {
        const modulo = await Modulo.findByPk(req.params.id); // Incluye los grados asociados al módulo
        if (modulo.profesor_id !== req.session.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para editar este módulo' });
        }
        // Obtener los cuestionarios asociados al módulo
        const cuestionarios = await Cuestionario.findAll({ where: { modulo_id: req.params.id } });

        res.render('editModuloQuizzes', {
            modulo,
            cuestionarios // Pasa los cuestionarios a la vista
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateModulo = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const modulo = await Modulo.findByPk(req.params.id);
        if (modulo.profesor_id !== req.session.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para editar este módulo' });
        }
        modulo.nombre = nombre;
        modulo.descripcion = descripcion;
        if (req.file) {
            modulo.imagen = `/uploads/modules/${req.file.filename}`;
        }
        await modulo.save();
        res.redirect('/teacher/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteModulo = async (req, res) => {
    try {
        const moduloId = req.params.id;

        const modulo = await Modulo.findByPk(moduloId);
        if (!modulo) {
            return res.status(404).json({ error: 'Módulo no encontrado' });
        }

        if (modulo.profesor_id !== req.session.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este módulo' });
        }

        // Eliminar registros en modulos_grados
        await Modulos_Grados.destroy({ where: { modulo_id: moduloId } });

        // Obtener los cuestionarios asociados al módulo
        const cuestionarios = await Cuestionario.findAll({ where: { modulo_id: moduloId } });

        for (const quiz of cuestionarios) {
            // Obtener los intentos asociados al cuestionario
            const intentos = await Intento.findAll({ where: { cuestionario_id: quiz.id } });
            for (const intento of intentos) {
                // Eliminar respuestas de cada intento
                await Intento_Respuesta.destroy({ where: { intento_id: intento.id } });
            }

            // Eliminar los intentos asociados al cuestionario
            await Intento.destroy({ where: { cuestionario_id: quiz.id } });

            // Obtener las preguntas asociadas al cuestionario
            const preguntas = await Pregunta.findAll({ where: { cuestionario_id: quiz.id } });
            for (const pregunta of preguntas) {
                // Eliminar respuestas asociadas a cada pregunta
                await Respuesta.destroy({ where: { pregunta_id: pregunta.id } });
            }

            // Eliminar las preguntas asociadas al cuestionario
            await Pregunta.destroy({ where: { cuestionario_id: quiz.id } });

            // Eliminar el cuestionario
            await Cuestionario.destroy({ where: { id: quiz.id } });
        }

        // Finalmente, eliminar el módulo
        await Modulo.destroy({ where: { id: moduloId } });

        res.redirect('/teacher/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getModuleQuizzes = async (req, res) => {
    try {
        const cuestionarios = await Cuestionario.findAll({ where: { modulo_id: req.params.id } });
        res.render('moduleQuizzes', { cuestionarios });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Nueva función manageGrades para gestionar grados en un módulo
exports.manageGrades = async (req, res) => {
    try {
        const { grado_id } = req.body;
        const modulo_id = req.params.id;

        // Verifica si el módulo pertenece al profesor
        const modulo = await Modulo.findByPk(modulo_id);
        if (modulo.profesor_id !== req.session.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para gestionar los grados de este módulo' });
        }

        // Asocia el grado al módulo
        await Modulos_Grados.create({ modulo_id, grado_id });

        res.redirect(`/teacher/modules/${modulo_id}/edit`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeGradeFromModule = async (req, res) => {
    try {
        const { id: moduloId } = req.params;
        const { gradoId } = req.body;

        const modulo = await Modulo.findByPk(moduloId);
        if (modulo.profesor_id !== req.session.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para modificar este módulo' });
        }

        const grado = await Grado.findByPk(gradoId);
        if (!grado) {
            return res.status(404).json({ error: 'Grado no encontrado' });
        }

        await modulo.removeGrado(grado);

        res.redirect(`/teacher/modules/${moduloId}/edit`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeQuizFromModule = async (req, res) => {
    try {
        const moduloId = req.params.id;
        const quizId = req.body.quizId;

        const modulo = await Modulo.findByPk(moduloId);
        if (!modulo) {
            return res.status(404).json({ error: 'Módulo no encontrado' });
        }

        if (modulo.profesor_id !== req.session.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para modificar este módulo' });
        }

        const quiz = await Cuestionario.findByPk(quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Cuestionario no encontrado' });
        }

        // Obtener los intentos asociados al cuestionario
        const intentos = await Intento.findAll({ where: { cuestionario_id: quizId } });
        for (const intento of intentos) {
            // Eliminar respuestas de cada intento
            await Intento_Respuesta.destroy({ where: { intento_id: intento.id } });
        }

        // Eliminar los intentos asociados al cuestionario
        await Intento.destroy({ where: { cuestionario_id: quizId } });

        // Obtener las preguntas asociadas al cuestionario
        const preguntas = await Pregunta.findAll({ where: { cuestionario_id: quizId } });
        for (const pregunta of preguntas) {
            // Eliminar respuestas asociadas a cada pregunta
            await Respuesta.destroy({ where: { pregunta_id: pregunta.id } });
        }

        // Eliminar las preguntas asociadas al cuestionario
        await Pregunta.destroy({ where: { cuestionario_id: quizId } });

        // Eliminar el cuestionario
        await Cuestionario.destroy({ where: { id: quizId } });

        res.redirect(`/teacher/modules/${moduloId}/quizzes`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createQuiz = async (req, res) => {
    try {
        const { id: moduloId } = req.params;
        const { nombre, descripcion } = req.body;
        const imagen = req.file ? `/uploads/quizzes/${req.file.filename}` : null;

        if (!nombre || !descripcion) {
            throw new Error('El nombre y la descripción son obligatorios.');
        }

        await Cuestionario.create({
            titulo: nombre,
            descripcion,
            imagen,
            modulo_id: moduloId
        });

        res.redirect(`/teacher/modules/${moduloId}/quizzes`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// QUESTION / ANSWER

// Function to get the details of a quiz
// Controlador para obtener los detalles del cuestionario
exports.getQuizDetails = async (req, res) => {
    try {
        const cuestionario = await Cuestionario.findByPk(req.params.id);
        if (!cuestionario) {
            return res.status(404).json({ error: 'Cuestionario no encontrado' });
        }

        // Cargar las preguntas asociadas al cuestionario
        const preguntas = await Pregunta.findAll({ where: { cuestionario_id: cuestionario.id } });

        res.render('quizDetails', { cuestionario, preguntas, modulo: req.params.moduleId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los detalles del cuestionario' });
    }
};

// Function to show the form to create a new question
exports.getCreateQuestionForm = (req, res) => {
    const { id: quizId, moduleId: moduleId } = req.params;
    res.render('createQuestion', { quizId, moduleId });
};

// Function to create a new question
exports.createQuestion = async (req, res) => {
    try {
        const { quizId, moduleId, pregunta, respuestas } = req.body;
        const imagen = req.file ? `/uploads/questions/${req.file.filename}` : null;

        // Create the question
        const nuevaPregunta = await Pregunta.create({
            cuestionario_id: quizId,
            pregunta,
            imagen
        });

        // Create the answers
        for (const respuesta of respuestas) {
            await Respuesta.create({
                pregunta_id: nuevaPregunta.id,
                respuesta: respuesta.texto,
                es_correcta: respuesta.es_correcta === 'true', // Check if this response is marked as correct
                imagen: respuesta.imagen ? `/uploads/answers/${respuesta.imagen}` : null
            });
        }

        res.redirect(`/teacher/quizzes/${quizId}/details/${moduleId}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEditQuestion = async (req, res) => {
    try {
        const { quizId, questionId, moduleId } = req.params;
        const pregunta = await Pregunta.findByPk(questionId);
        const respuestas = await Respuesta.findAll({ where: { pregunta_id: questionId } });

        res.render('editQuestion', {
            quizId,
            moduleId,
            pregunta,
            respuestas
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.postEditQuestion = async (req, res) => {
    try {
        const { quizId, moduleId, questionId } = req.params;
        const { pregunta, respuestas } = req.body;
        const files = req.files;

        const imagen = files['questionImage'] ? `/uploads/questions/${files['questionImage'][0].filename}` : null;

        // Actualizar la pregunta
        await Pregunta.update({
            pregunta,
            imagen
        }, {
            where: { id: questionId }
        });

        // Eliminar las respuestas marcadas para eliminación
        for (let i = 0; i < respuestas.length; i++) {
            const respuesta = respuestas[i];
            if (respuesta.eliminar === 'true') {
                await Respuesta.destroy({
                    where: { id: respuesta.id }
                });
            }
        }

        // Actualizar o crear las respuestas restantes
        for (let i = 0; i < respuestas.length; i++) {
            const respuesta = respuestas[i];
            if (respuesta.eliminar !== 'true') {
                const respuestaImagen = files[`respuestas[${i}][imagen]`] ? `/uploads/answers/${files[`respuestas[${i}][imagen]`][0].filename}` : null;

                // Si la respuesta tiene un ID, actualízala; de lo contrario, créala
                if (respuesta.id) {
                    await Respuesta.update({
                        respuesta: respuesta.texto,
                        es_correcta: respuesta.es_correcta === 'true',
                        imagen: respuestaImagen
                    }, {
                        where: { id: respuesta.id }
                    });
                } else {
                    await Respuesta.create({
                        pregunta_id: questionId,
                        respuesta: respuesta.texto,
                        es_correcta: respuesta.es_correcta === 'true',
                        imagen: respuestaImagen
                    });
                }
            }
        }

        res.redirect(`/teacher/quizzes/${quizId}/details/${moduleId}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para mostrar el formulario de edición del cuestionario
exports.getEditQuiz = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const cuestionario = await Cuestionario.findByPk(quizId);
        if (!cuestionario) {
            return res.status(404).json({ message: 'Cuestionario no encontrado' });
        }
        res.render('editQuiz', { cuestionario });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para procesar la solicitud de edición del cuestionario
exports.postEditQuiz = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const { moduleId, titulo, descripcion } = req.body;
        let imagen = null;

        // Verificar si se proporcionó una nueva imagen
        if (req.file) {
            imagen = `/uploads/quizzes/${req.file.filename}`;
            // Actualizar la información del cuestionario
            await Cuestionario.update({ titulo, descripcion, imagen }, { where: { id: quizId } });
        } else {
            // Actualizar la información del cuestionario
            await Cuestionario.update({ titulo, descripcion }, { where: { id: quizId } });
        }


        res.redirect(`/teacher/modules/${moduleId}/quizzes`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getGradeDetails = async (req, res) => {
    try {
        const gradoId = req.params.gradoId;
        const moduloId = req.params.modulo;

        // Obtener los estudiantes del grado
        const estudiantes = await Usuario.findAll({
            where: { grado: gradoId, tipo: 'estudiante' }
        });

        // Obtener los cuestionarios del módulo especificado
        const cuestionarios = await Cuestionario.findAll({
            where: { modulo_id: moduloId }
        });

        // Calcular las notas de cada estudiante
        const notasEstudiantes = await Promise.all(estudiantes.map(async estudiante => {
            const notas = await Promise.all(cuestionarios.map(async cuestionario => {
                // Obtener array de intentos con sus notas y comentarios
                const intentos = await calculateQuizAttempts(cuestionario.id, estudiante.id);
                return {
                    cuestionario,
                    intentos // Aquí se pasa el array de intentos
                };
            }));

            return {
                estudiante,
                notas
            };
        }));

        res.render('gradeDetails', { gradoId, moduloId, notasEstudiantes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const calculateQuizAttempts = async (cuestionarioId, estudianteId) => {
    try {
        const intentos = await Intento.findAll({
            where: {
                cuestionario_id: cuestionarioId,
                estudiante_id: estudianteId
            },
            order: [['id', 'DESC']] // Ordenar por ID en orden descendente para obtener los intentos más recientes primero
        });

        const preguntas = await Pregunta.findAll({
            where: { cuestionario_id: cuestionarioId }
        });

        const respuestasCorrectas = await Respuesta.findAll({
            where: {
                pregunta_id: preguntas.map(p => p.id),
                es_correcta: true
            }
        });

        const resultadosIntentos = [];

        for (const intento of intentos) {
            const respuestasEstudiante = await Intento_Respuesta.findAll({
                where: {
                    intento_id: intento.id
                }
            });

            let correctAnswers = 0;
            respuestasEstudiante.forEach(respuestaEstudiante => {
                const isCorrect = respuestasCorrectas.some(respuestaCorrecta => {
                    return respuestaCorrecta.id === respuestaEstudiante.respuesta_id;
                });
                if (isCorrect) correctAnswers++;
            });

            const totalQuestions = preguntas.length;
            const percentage = (correctAnswers / totalQuestions) * 100;

            // Obtener comentario del intento (si es null, asignar cadena vacía)
            const comentario = intento.comentario_profesor ? intento.comentario_profesor : '';

            resultadosIntentos.push({
                intento_id: intento.id,
                percentage: percentage,
                comentario: comentario
            });
        }

        return resultadosIntentos;
    } catch (error) {
        throw new Error('Error al calcular los intentos del cuestionario: ' + error.message);
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { intentoId, comentario } = req.body;

        // Actualizar el comentario del intento
        await Intento.update(
            { comentario_profesor: comentario },
            { where: { id: intentoId } }
        );

        res.redirect('back'); // Redirigir de vuelta a la página anterior
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

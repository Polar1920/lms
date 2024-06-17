const Modulo = require('../models/moduleModel');
const Cuestionario = require('../models/quizModel');
const Usuario = require('../models/userModel');
const Modulos_Grados = require('../models/Modulos_Grados');
const Pregunta = require('../models/questionModel');
const Respuesta = require('../models/answerModel');
const Intento = require('../models/attemptModel');
const Intento_Respuesta = require('../models/attemptAnswerModel');

exports.getDashboard = async (req, res) => {
    try {
        const estudianteId = req.session.user.id;

        // Obtener los IDs de los módulos asociados al grado del estudiante desde la tabla intermedia
        const modulosGrados = await Modulos_Grados.findAll({
            where: { grado_id: req.session.user.grado } // Filtrar por el ID del grado del estudiante
        });

        // Obtener los IDs de los módulos a partir de los resultados de la tabla intermedia
        const moduloIds = modulosGrados.map(moduloGrado => moduloGrado.modulo_id);

        // Obtener los detalles de los módulos a partir de los IDs obtenidos
        const modulos = await Modulo.findAll({
            where: { id: moduloIds } // Filtrar por los IDs de los módulos asociados al grado del estudiante
        });

        // Obtener los cuestionarios de los módulos
        const cuestionarios = await Cuestionario.findAll({
            where: { modulo_id: moduloIds }
        });

        // Agrupar cuestionarios por módulo
        const cuestionariosPorModulo = {};
        cuestionarios.forEach(cuestionario => {
            if (!cuestionariosPorModulo[cuestionario.modulo_id]) {
                cuestionariosPorModulo[cuestionario.modulo_id] = [];
            }
            cuestionariosPorModulo[cuestionario.modulo_id].push(cuestionario);
        });

        // Calcular las notas de cada módulo para el estudiante
        const notasFinales = await Promise.all(modulos.map(async modulo => {
            const cuestionariosModulo = cuestionariosPorModulo[modulo.id] || [];
            const notas = await Promise.all(cuestionariosModulo.map(async cuestionario => {
                const percentage = await calculateQuizLast(cuestionario.id, estudianteId);
                return percentage;
            }));

            const sumaNotas = notas.reduce((acc, nota) => acc + nota, 0);
            const cantNotas = notas.length;
            const notaFinal = cantNotas > 0 ? sumaNotas / cantNotas : 0;

            return {
                modulo,
                notaFinal
            };
        }));

        res.render('studentDashboard', { modulos, notasFinales, user: req.session.user }); // Renderizar la vista con los módulos obtenidos y las notas
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getModulo = async (req, res) => {
    try {
        const modulo = await Modulo.findByPk(req.params.id, {
            include: [{ model: Cuestionario, as: 'cuestionarios' }] // Cambia el alias a 'cuestionarios'
        });
        res.status(200).json(modulo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDetallesModulo = async (req, res) => {
    try {
        const modulo = await Modulo.findByPk(req.params.id, {
            include: [{ model: Cuestionario, as: 'cuestionarios' }]
        });

        // Calcular el porcentaje de cada cuestionario en el módulo
        for (let i = 0; i < modulo.cuestionarios.length; i++) {
            const cuestionario = modulo.cuestionarios[i];
            const porcentaje = await calculateQuizLast(cuestionario.id, req.session.user.id);
            cuestionario.porcentaje = porcentaje;
        }

        res.render('studentModuleDetails', { modulo }); // Renderiza la vista con los detalles del módulo
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controlador para obtener los detalles del cuestionario para el estudiante
exports.getQuizDetails = async (req, res) => {
    try {
        const cuestionario = await Cuestionario.findByPk(req.params.id);
        if (!cuestionario) {
            return res.status(404).json({ error: 'Cuestionario no encontrado' });
        }

        // Cargar las preguntas asociadas al cuestionario
        const preguntas = await Pregunta.findAll({ where: { cuestionario_id: cuestionario.id } });

        // Cargar las respuestas asociadas a cada pregunta
        for (let i = 0; i < preguntas.length; i++) {
            const pregunta = preguntas[i];
            pregunta.respuestas = await Respuesta.findAll({ where: { pregunta_id: pregunta.id } });
        }

        console.log(cuestionario.modulo_id);

        res.render('studentQuiz', { cuestionario, preguntas, moduleId: cuestionario.modulo_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los detalles del cuestionario' });
    }
};

exports.submitAttempt = async (req, res) => {
    try {
        const { cuestionarioId, moduleId } = req.body;
        const estudianteId = req.session.user.id;

        // Crear un nuevo intento
        const intento = await Intento.create({
            cuestionario_id: cuestionarioId,
            estudiante_id: estudianteId,
            nota: 0, // Aquí podrías calcular la nota en base a las respuestas
            comentario_profesor: null // Puedes dejar este campo en null por ahora
        });

        // Guardar las respuestas seleccionadas en el intento
        for (const key in req.body) {
            if (key.startsWith('respuesta_')) {
                const preguntaId = key.split('_')[1];
                const respuestaId = req.body[key];

                await Intento_Respuesta.create({
                    intento_id: intento.id,
                    pregunta_id: preguntaId,
                    respuesta_id: respuestaId
                });
            }
        }

        res.redirect(`/student/modules/${moduleId}/details`); // Usar el moduleId pasado desde el formulario
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const calculateQuizLast = async (cuestionarioId, estudianteId) => {
    try {
        const intento = await Intento.findOne({
            where: {
                cuestionario_id: cuestionarioId,
                estudiante_id: estudianteId
            },
            order: [['id', 'DESC']] // Ordenar por ID en orden descendente para obtener el último intento
        });

        if (!intento) {
            console.log('No se encontró el intento del estudiante para el cuestionario.');
            return 0;
        }

        const preguntas = await Pregunta.findAll({
            where: { cuestionario_id: cuestionarioId }
        });

        const respuestasCorrectas = await Respuesta.findAll({
            where: {
                pregunta_id: preguntas.map(p => p.id),
                es_correcta: true
            }
        });

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

        return percentage;
    } catch (error) {
        throw new Error('Error al calcular la nota del cuestionario: ' + error.message);
    }
};

exports.getQuizAttempts = async (req, res) => {
    try {
        const cuestionarioId = req.params.id;
        const moduloId = req.params.modulo;
        const estudianteId = req.session.user.id;

        // Obtener todos los intentos del estudiante para el cuestionario
        const intentos = await Intento.findAll({
            where: {
                cuestionario_id: cuestionarioId,
                estudiante_id: estudianteId
            },
            order: [['createdAt', 'DESC']] // Ordenar por fecha de creación en orden descendente
        });

        // Añadir las notas y comentarios a cada intento
        for (let i = 0; i < intentos.length; i++) {
            const intento = intentos[i];
            intento.nota = await calculateQuizAttempt(intento.id);
            // El comentario del profesor ya está en el objeto intento
        }

        res.render('studentAttempts', { intentos, cuestionarioId, moduloId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const calculateQuizAttempt = async (intentoId) => {
    try {
        const intento = await Intento.findByPk(intentoId);
        if (!intento) throw new Error('Intento no encontrado');

        const preguntas = await Pregunta.findAll({
            where: { cuestionario_id: intento.cuestionario_id }
        });

        const respuestasCorrectas = await Respuesta.findAll({
            where: {
                pregunta_id: preguntas.map(p => p.id),
                es_correcta: true
            }
        });

        const respuestasEstudiante = await Intento_Respuesta.findAll({
            where: { intento_id: intentoId }
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

        return percentage;
    } catch (error) {
        throw new Error('Error al calcular la nota del intento: ' + error.message);
    }
};



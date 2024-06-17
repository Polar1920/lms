const Modulo = require('../models/moduleModel');
const Usuario = require('../models/userModel');

exports.getModules = async (req, res) => {
    try {
        const modulos = await Modulo.findAll();
        res.status(200).json(modulos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getModule = async (req, res) => {
    try {
        const modulo = await Modulo.findByPk(req.params.id);
        res.status(200).json(modulo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createModule = async (req, res) => {
    try {
        const { titulo, descripcion, imagen, profesor_id } = req.body;
        const modulo = await Modulo.create({
            titulo,
            descripcion,
            imagen,
            profesor_id
        });
        res.status(201).json(modulo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateModule = async (req, res) => {
    try {
        const { titulo, descripcion, imagen } = req.body;
        const modulo = await Modulo.findByPk(req.params.id);
        modulo.titulo = titulo;
        modulo.descripcion = descripcion;
        modulo.imagen = imagen;
        await modulo.save();
        res.status(200).json(modulo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteModule = async (req, res) => {
    try {
        const modulo = await Modulo.findByPk(req.params.id);
        await modulo.destroy();
        res.status(204).json({ message: 'Módulo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

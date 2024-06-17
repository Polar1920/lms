const bcrypt = require('bcrypt');
const Usuario = require('../models/userModel');
const Grado = require('../models/gradeModel');

exports.createUser = async (req, res) => {
    try {
        const { nombre, apellido, username, password, tipo, grado } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await Usuario.create({
            nombre,
            apellido,
            username,
            password: hashedPassword,
            tipo,
            grado
        });
        //res.status(201).json(newUser);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ error: 'Error de controller: ' + error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { nombre, apellido, username, tipo, grado } = req.body;
        const user = await Usuario.findByPk(req.params.id);
        user.nombre = nombre;
        user.apellido = apellido;
        user.username = username;
        user.tipo = tipo;
        user.grado = grado;
        await user.save();
        //res.status(200).json(user);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await Usuario.findByPk(req.params.id);
        await user.destroy();
        //res.status(204).json({ message: 'Usuario eliminado exitosamente' });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createGrade = async (req, res) => {
    try {
        const { nombre } = req.body;
        const grado = await Grado.create({ nombre });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateGrade = async (req, res) => {
    try {
        const { nombre } = req.body;
        const grado = await Grado.findByPk(req.params.id);
        grado.nombre = nombre;
        await grado.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteGrade = async (req, res) => {
    try {
        const grado = await Grado.findByPk(req.params.id);
        await grado.destroy();
        //res.status(204).json({ message: 'Grado eliminado exitosamente' });
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.renderDashboard = async (req, res) => {
    try {
        const users = await Usuario.findAll();
        const grades = await Grado.findAll();
        console.log(users)
        res.render('adminDashboard', { users, grades });
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar el panel de administrador: ' + error.message });
    }
};

exports.renderCreateUser = async (req, res) => {
    try {
        const grados = await Grado.findAll();
        res.render('createUser', { grados });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.renderEditUser = async (req, res) => {
    try {
        const user = await Usuario.findByPk(req.params.id);
        const grados = await Grado.findAll();
        res.render('editUser', { user, grados });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.renderCreateGrade = (req, res) => {
    res.render('createGrade');
};

exports.renderEditGrade = async (req, res) => {
    try {
        const grade = await Grado.findByPk(req.params.id);
        res.render('editGrade', { grade });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

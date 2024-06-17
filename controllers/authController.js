const bcrypt = require('bcrypt');
const Usuario = require('../models/userModel');

exports.register = async (req, res) => {
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
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Error de controller: ' + error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Usuario.findOne({ where: { username } });
        if (user && await bcrypt.compare(password, user.password)) {
            // Guardar los datos del usuario en la sesión
            req.session.user = user;

            // Redireccionar al dashboard correspondiente
            let dashboardURL = '/';
            switch (user.tipo) {
                case 'admin':
                    dashboardURL = '/admin/dashboard'; // Usar la ruta del dashboard de admin
                    break;
                case 'profesor':
                    dashboardURL = '/teacher/dashboard'; // Usar la ruta del dashboard de profesor
                    break;
                case 'estudiante':
                    dashboardURL = '/student/dashboard'; // Usar la ruta del dashboard de estudiante
                    break;
                default:
                    dashboardURL = '/';
            }
            res.redirect(dashboardURL);
        } else {
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: 'Cierre de sesión exitoso' });
};

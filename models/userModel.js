const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('admin', 'profesor', 'estudiante'),
        allowNull: false
    },
    grado: {
        type: DataTypes.STRING
    },
    imagen: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false // Esto agrega las columnas createdAt y updatedAt automáticamente
});

module.exports = Usuario;

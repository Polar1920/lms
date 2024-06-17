const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Grado = sequelize.define('Grado', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = Grado;

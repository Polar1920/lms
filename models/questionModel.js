const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cuestionario = require('./quizModel');

const Pregunta = sequelize.define('Pregunta', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    cuestionario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cuestionario,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    pregunta: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

Pregunta.belongsTo(Cuestionario, { foreignKey: 'cuestionario_id', onDelete: 'CASCADE' });

module.exports = Pregunta;

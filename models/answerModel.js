const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pregunta = require('./questionModel');

const Respuesta = sequelize.define('Respuesta', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pregunta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Pregunta,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    respuesta: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    es_correcta: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

Respuesta.belongsTo(Pregunta, { foreignKey: 'pregunta_id', onDelete: 'CASCADE' });

module.exports = Respuesta;

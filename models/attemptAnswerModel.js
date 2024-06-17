const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Intento = require('./attemptModel');
const Pregunta = require('./questionModel');
const Respuesta = require('./answerModel');

const Intento_Respuesta = sequelize.define('Intento_Respuesta', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    intento_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Intento,
            key: 'id'
        }
    },
    pregunta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Pregunta,
            key: 'id'
        }
    },
    respuesta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Respuesta,
            key: 'id'
        }
    }
}, {
    timestamps: false
});

Intento_Respuesta.belongsTo(Intento, { foreignKey: 'intento_id' });
Intento_Respuesta.belongsTo(Pregunta, { foreignKey: 'pregunta_id' });
Intento_Respuesta.belongsTo(Respuesta, { foreignKey: 'respuesta_id' });

module.exports = Intento_Respuesta;

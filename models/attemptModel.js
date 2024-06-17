const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./userModel');
const Cuestionario = require('./quizModel');

const Intento = sequelize.define('Intento', {
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
        }
    },
    estudiante_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    nota: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    comentario_profesor: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true // Esto agrega las columnas createdAt y updatedAt automáticamente
});

Intento.belongsTo(Cuestionario, { foreignKey: 'cuestionario_id' });
Intento.belongsTo(Usuario, { foreignKey: 'estudiante_id' });

module.exports = Intento;

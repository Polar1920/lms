const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Modulo = require('./moduleModel'); // Importa el modelo Modulo
const Grado = require('./gradeModel'); // Importa el modelo Grado

const Modulos_Grados = sequelize.define('Modulos_Grados', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    modulo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Modulo,
            key: 'id'
        }
    },
    grado_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Grado,
            key: 'id'
        }
    }
}, {
    timestamps: false // Esto evita que Sequelize agregue las columnas createdAt y updatedAt automáticamente
});

module.exports = Modulos_Grados;

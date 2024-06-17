const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Modulo = require('./moduleModel');

const Cuestionario = sequelize.define('Cuestionario', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING
    },
    modulo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Modulo,
            key: 'id'
        }
    }
}, {
    timestamps: false
});

Cuestionario.belongsTo(Modulo, { foreignKey: 'modulo_id', onDelete: 'CASCADE' });

module.exports = Cuestionario;

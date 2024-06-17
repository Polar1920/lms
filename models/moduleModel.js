const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./userModel'); // Importa el modelo de Usuario

const Modulo = sequelize.define('Modulo', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    profesor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    imagen: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

Modulo.belongsTo(Usuario, { foreignKey: 'profesor_id' });

module.exports = Modulo;

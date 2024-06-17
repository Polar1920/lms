const sequelize = require('../config/database');
const Modulo = require('./moduleModel');
const Grado = require('./gradeModel');
const Cuestionario = require('./quizModel');

// Define las asociaciones después de que los modelos hayan sido importados
Grado.belongsToMany(Modulo, { through: 'Modulos_Grados', foreignKey: 'grado_id' });
Modulo.belongsToMany(Grado, { through: 'Modulos_Grados', foreignKey: 'modulo_id' });

Modulo.hasMany(Cuestionario, { foreignKey: 'modulo_id', as: 'cuestionarios' });
Cuestionario.belongsTo(Modulo, { foreignKey: 'modulo_id' });

(async () => {
    try {
        await sequelize.sync({ alter: true }); // Usa alter para no perder datos existentes
        console.log('Base de datos sincronizada');
    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
    }
})();
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const forgetpasswordSchema = new Schema({

    id: {
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    uuid: 
    {
        type: Sequelize.STRING(255),
    },
    
    isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false
 }
});

module.exports = mongoose.model('ForgetPwd',forgetpasswordSchema);
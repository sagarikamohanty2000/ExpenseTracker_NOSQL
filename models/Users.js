const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
 name: {
       type : String,
       required : true
 },
 email: {
        type: String,
        required : true
 },
 password: {
        type: String,
       required : true
 },
 isPremium: {
       type: Boolean
},
expenses: items [{
         expenseId : {type: Schema.Types.ObjectId, ref:'Expense', required: true },
         totalExpense: {type: Number,required: true }
}],
order: items [{
       orderId : {type: Schema.Types.ObjectId, ref:'Order', required: true },
}],
forgetpassword: items [{
       frgId : {type: Schema.Types.ObjectId, ref:'ForgetPwd', required: true },
}],

fileData: items[{
       fileUrl : {type: String}
}]
});

module.exports = mongoose.model('User',userSchema);
var mongoose = require('mongoose');
var dataTables = require('mongoose-datatables');
var Schema = mongoose.Schema;
var loginHistorySchema = new Schema({
	userId: {type: Schema.Types.ObjectId,ref:'users'},
	agent: {type : String},
	location: {type : String},
    ip:{
		type : String,
		default:""
	},
    IsAuth: {
        type : Number,
        default:0  /* 0 = no 1 = yes */
    },
    createdAt : {
		type : Date,
		default : Date.now
	}
});
module.exports = mongoose.model('loginHistory',loginHistorySchema, 'loginHistory');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var historySchema = new Schema({
	userId: {type: Schema.Types.ObjectId,ref:'users'},
	historyType: Number,
    ip:{
		type : String,
		default:""
	},
    createdAt : {
		type : Date,
		default : Date.now
	}
});

module.exports = mongoose.model('history',historySchema);

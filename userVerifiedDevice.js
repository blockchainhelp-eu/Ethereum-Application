var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userVerifiedDeviceSchema = new Schema({
    userId :  {
        type: Schema.Types.ObjectId,ref:'users'
    },
    ip:{
        type: String,
        default: ''
    },
    agent: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    status: {
        type: Number,
        default: 0 // 0 Pending | 1 Verified | 2 Revoked
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    updatedAt : {
        type : Date,
        default : Date.now
    }
});
module.exports = mongoose.model('userVerifiedDevice',userVerifiedDeviceSchema,'userVerifiedDevice');




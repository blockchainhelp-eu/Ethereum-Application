var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose,8);
var Schema = mongoose.Schema;

/*
* Verification Types:
*
*  1, Register Verification
*  2, PWD verification
*  3, PGP verification
*  4, Security setting verification
*  5, Notifications verification
* */

var userVerificationSchema = new Schema({
    userId :  {
        type: Schema.Types.ObjectId,ref:'users'
    },
    type:{
        type: Number,
        default: 0
    },
    secret:{
        type: String,
        default: ''
    },
    updateField :{
      type: Array,
      default : ''
    },
    uiContent:{
        type: Object,
        default : ''
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
module.exports = mongoose.model('userVerification',userVerificationSchema,'userVerification');




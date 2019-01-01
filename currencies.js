var mongoose  = require('mongoose');
var Schema = mongoose.Schema;
var Float = require('mongoose-float').loadType(mongoose,4);
var Float8 = require('mongoose-float').loadType(mongoose,8);

var currenciesSchema = new Schema({
    name : String,
    symbol : String,
    isPrimary : {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        default: 1  // 1 Active | 2 Removed
    },
    confirmation: {
        type : Number,
        default : 0
    },
    minWithdrawAmount : {
        type : Float
    },
    trnFees : {
        type : Float8
    },
    abi: {
        type : Array,
        default: []
    },
    contractAddress: {
        type : String,
        default: null
    },
    is_contract: {
        type : Number,
        default: false
    },
    symbolImage: {
        type : String
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    updatedAt : {
        type : Date,
        default : Date.now
    },
});
/* export this schema */
module.exports = mongoose.model('currencies',currenciesSchema);

// Pending for Withdraw Fields...
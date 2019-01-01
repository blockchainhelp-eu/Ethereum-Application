var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose,8);
var Schema = mongoose.Schema;
var balancesSchema = new Schema({
    userId :  {
        type: Schema.Types.ObjectId,ref:'users'
    },
    currencyId : {
        type: Schema.Types.ObjectId,ref:'currencies'
    },
    address: {
        type : String,
        default: null
    },
    availableBalance : {
        type : Float,
        default: 0
    },
    unconfirmedBalance : {
        type : Float,
        default: 0
    },
    frozenBalance : {
        type : Float,
        default: 0
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
module.exports = mongoose.model('user_balances',balancesSchema, 'userBalances');



var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose,8);
var Schema = mongoose.Schema;
var ordersSchema = new Schema({
    userId : {
        type: Schema.Types.ObjectId,ref:'users'
    },
    type: {
        type : Number,
        default: 1 // 1 Buy, 2 Sell
    },
    pairId: { // Modified by uttam!
        type: Schema.Types.ObjectId,ref:'exchangePairs'
    },
    primaryCurrencyId: {
        type: Schema.Types.ObjectId,ref:'currencies' // Currency that user is pay..
    },
    secondaryCurrencyId: {
        type: Schema.Types.ObjectId,ref:'currencies' // Currency that user receive..
    },
    price: {
        type: Float,
        default: 0
    },
    qty: {
        total: {
            type: Float,
            default: 0
        },
        qtySold: {
            type: Float,
            default: 0
        },
        qtyRemain: {
            type: Float,
            default: 0
        },
    },
    status: {
        type: Number,
        default: 0 // 0 Pending | 1 In Queue | 2 Confirmed | 3 Cancelled
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
module.exports = mongoose.model('orders',ordersSchema);



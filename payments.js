var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 8);
var Schema = mongoose.Schema;
var paymentsSchema = new Schema({
    type: {
        type: Number // 1 Bought | 2 Sold
    },
    userId : {
        type: Schema.Types.ObjectId,ref:'users' // Taker User
    },
    primaryUserId : {
        type: Schema.Types.ObjectId,ref:'users' // Maker User
    },
    orderId: {
        type: Schema.Types.ObjectId, ref: 'orders' // Taker
    },
    primaryOrderId: {
        type: Schema.Types.ObjectId, ref: 'orders' // Maker
    },
    pairId: {
        type: Schema.Types.ObjectId, ref: 'exchangePairs'
    },
    primaryCurrencyId: {
        type: Schema.Types.ObjectId, ref: 'currencies'
    },
    secondaryCurrencyId: {
        type: Schema.Types.ObjectId, ref: 'currencies'
    },
    // amounts: {
    //     paid: {
    //         currency: {
    //             type: Schema.Types.ObjectId, ref: 'currencies'
    //         },
    //         amount: {
    //             type: Float,
    //             default: 0
    //         }
    //     },
    //     receive: {
    //         currency: {
    //             type: Schema.Types.ObjectId, ref: 'currencies'
    //         },
    //         amount: {
    //             type: Float,
    //             default: 0
    //         }
    //     }
    // },
    qty: {
        type: Float,
        default: 0
    },
    price: {
            type: Float,
            default: 0
    },
    fee: {
        percentage: {
            type: Number, // Fees in Percentage
            default: 0
        },
        amount: {
            type: Float,
            default: 0
        }
    },
    status: {
        type: Number,
        default: 0 // 0 Pending | 1 Confirmed | 2 Cancelled | 3 Removed
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('payments', paymentsSchema);



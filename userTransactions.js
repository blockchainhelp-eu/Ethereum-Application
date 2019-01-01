var mongoose = require('mongoose');

var Float = require('mongoose-float').loadType(mongoose,8);
var Schema = mongoose.Schema;
var dataTables = require('mongoose-datatables');
var userTransactionsSchema = new Schema({
    userId : {
        type: Schema.Types.ObjectId,ref:'users'
    },
    currencyId: {
        type: Schema.Types.ObjectId,ref:'currencies',
        default: null
    },
    type: {
        type : Number,
        default: 1 // 1 Send, 2 Received, 3 Sold on Exchange, 4 Bought from Exchange
    },
    /*currency: {
        type: Schema.Types.ObjectId,ref:'currencies',
        default: null
    },*/
    amount: {
        type: Float
    },
    amountUsd: {
        type: Float,
        default: 0
    },
    address: {
        type: String,
        default: null
    },
    txId: {
        type: String,
        default: null
    },
    txFee: {
        type: Float,
        default: 0
    },
    paymentId: {
        // type: Schema.Types.ObjectId,ref:'orders', // Currency that user is pay..
        type: String,
        default: null
    },
    status: {
        type: Number,
        default: 0 // 0 Pending | 1 Approved | 2 Cancelled | 99 Removed
    },
    inProcess: {
        type: Number,
        default: 0 // 0 Pending | 1 Approved | 2 Cancelled | 99 Removed
    },
    adminApproved: {
        type: Number,
        default: 0
    },
    adminApprovedIp: {
        type: String,
        default: null
    },
    approvedDate: {
        type: Date,
        default: Date.now
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
userTransactionsSchema.plugin(dataTables);
module.exports = mongoose.model('user_transactions',userTransactionsSchema, 'userTransactions');



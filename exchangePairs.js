var mongoose  = require('mongoose');
var Schema = mongoose.Schema;

var exchangePairsSchema = new Schema({
    primaryCurrency: {
        type: Schema.Types.ObjectId, ref: 'currencies'
    },
    secondaryCurrency: {
        type: Schema.Types.ObjectId, ref: 'currencies'
    },
    status: {
        type: Number,
        default: 1  //0 Pending | 1 Active | 2 In-Active
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

exchangePairsSchema.virtual('latestPayment',{
    ref: 'payments',
    localField: '_id',
    foreignField: 'pairId',
    justOne: true, // for many-to-1 relationships
    options: {  sort: { _id: -1 } }
});

exchangePairsSchema.virtual('firstPayment',{
    ref: 'payments',
    localField: '_id',
    foreignField: 'pairId',
    justOne: true, // for many-to-1 relationships
    options: {  sort: { _id: 1 }, match: {createdAt:{$gt:new Date(Date.now() - 24*60*60 * 1000)}} },
});

exchangePairsSchema.virtual('todayPayment',{
    ref: 'payments',
    localField: '_id',
    foreignField: 'pairId',
    options: {  match: {createdAt:{$gt:new Date(Date.now() - 24*60*60 * 1000)}} },
});

/* export this schema */
module.exports = mongoose.model('exchangePairs',exchangePairsSchema,'exchangePairs');
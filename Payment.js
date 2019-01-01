var paymentSchema = require('./schema/payments');
var ObjectID = require('mongodb').ObjectID;
exports.getPaymentHistory = function (userId, req, callback) {
    var findArray = {};
    if (userId != '') {
        findArray = {userId: mongoose.Types.ObjectId(userId)};
    }
    // if (req.body.id !== undefined && req.body.id !== '') {
    //     findArray['_id'] = req.body.id;
    // }
    if (req.body.fromPrice !== undefined && req.body.toPrice !== undefined && req.body.fromPrice !== '' && req.body.toPrice !== '') {
        findArray['price'] = {"$gte": Number(req.body.fromPrice), "$lte": Number(req.body.toPrice)};
    }
    /*if (req.body.fromReceive !== undefined && req.body.toReceive !== undefined && req.body.fromReceive !== '' && req.body.toReceive !== '') {
     findArray['amounts.receive.amount'] = {
     "$gte": Number(req.body.fromReceive),
     "$lte": Number(req.body.toReceive)
     };
     }*/

    if (req.body.fromFee !== undefined && req.body.toFee !== undefined && req.body.fromFee !== '' && req.body.toFee !== '') {
        findArray['fee.amount'] = {"$gte": Number(req.body.fromFee), "$lte": Number(req.body.toFee)};
    }
    if (req.body.fromRate !== undefined && req.body.toRate !== undefined && req.body.fromRate !== '' && req.body.toRate !== '') {
        findArray['qty'] = {"$gte": Number(req.body.fromRate), "$lte": Number(req.body.toRate)};
    }
    if (req.body.status !== undefined && req.body.status !== '') {
        findArray['status'] = req.body.status;
    }
    if (req.body.type !== undefined && req.body.type !== '') {
        findArray['type'] = req.body.type;
    }
    if (req.body.pair !== undefined && req.body.pair !== '') {
        findArray['pair'] = mongoose.Types.ObjectId(req.body.pair)
    }
    if (req.body.paymentFromDate !== undefined && req.body.paymentToDate !== undefined && req.body.paymentFromDate !== '' && req.body.paymentToDate !== '') {
        var startDate = moment(req.body.paymentFromDate).format("Y-MM-DD 00:00:00");
        var endDate = moment(req.body.paymentToDate).format("Y-MM-DD 23:59:59");
        findArray['createdAt'] = {"$gte": startDate, "$lte": endDate};
    }
    var sort = {createdAt: -1};
    if (req.body.order && req.body.order[0].column && req.body.order[0].dir) {
        var reqBody = req.body.order[0].column;
        sort = {[reqBody]: (req.body.order[0].dir == 'desc' ? -1 : 1)}
    }
    var query = paymentSchema.find(findArray)
        .populate({path: 'primaryCurrencyId', select: 'symbol'})
        .populate({path: 'secondaryCurrencyId', select: 'symbol'})
        .populate({path: 'userId', select: 'email'})
    query.sort(sort)
    query.skip(Number(req.body.start))
    query.limit(Number(req.body.length))
    query.lean()
    query.exec(function (err, response) {
        if (err) {
            callback({status: false});
            return false;
        }
        getPaymentsCounts(findArray, function (count) {
            callback({status: true, data: response, total: count});
        })
    });
};

getPaymentsCounts = function (whereCondition, callback) {
    paymentSchema.find(whereCondition, function (err, result) {
        if (err) {
            callback(0);
            return false;
        }
        callback(result.length)
    })
};

exports.getTodayPaymentsPromise = function(condition) {
    if(condition == undefined) {
        condition = {};
    }
    condition.createdAt = {$gt:new Date(Date.now() - 24*60*60 * 1000)};
    return paymentSchema.find(condition).lean();
}

exports.getUserEstimateBal = function (currencyId, bitcoinId, callback) {
    var query = paymentSchema.findOne({
        $or: [
            {"primaryCurrencyId": currencyId, "secondaryCurrencyId": bitcoinId},
            {"secondaryCurrencyId": currencyId, "primaryCurrencyId": bitcoinId}
        ]
    })
    query.sort({createdAt: -1}).exec(function (err, response) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, response)
    })
};

/*bkp*/
// db.getCollection('payments').findOne({
//         $or: [{"amounts.paid.currency": ObjectId("5b112f05258a54529ca1e34a"), "amounts.receive.currency": ObjectId("5b112fa9258a54529ca1e353")},
//             {"amounts.receive.currency": ObjectId("5b112f05258a54529ca1e34a"), "amounts.paid.currency": ObjectId("5b112fa9258a54529ca1e353")}
//         ]
//     }
// )


exports.getTradeHistoryExchange = function (condition, callback) {
    var query = paymentSchema.find(condition);
    query.sort({createdAt: -1});
    query.limit(20);
    query.exec(function (err, response) {
        if (err) {
            callback({status: false, err: err});
            return false;
        }
        callback({status: true, data: response});
    });
}

exports.getChartData = function (pairId, callback) {
    /*var moment = require('moment');
     var today = moment().startOf('day');
     var tomorrow = moment(today).endOf('day');
     createdAt: {$gte: today.toDate(), $lt: tomorrow.toDate()}*/
    paymentSchema.aggregate()
        .match({
            status: 1,
            pairId: pairId,
            //createdAt:{$gt:new Date(Date.now() - 24*60*60 * 1000)}
        })
        .group({
            _id: {
                // interval: {
                //     $trunc: {$divide: [{$minute: "$createdAt"}, 10]}
                //     //$trunc: {$divide: [{$month: "$createdAt"}, 1]}
                // },
                "$subtract": [
                    {"$toLong": "$createdAt"},
                    {"$mod": [{"$toLong": "$createdAt"}, 1000 * 60 * 1]}
                ]
            },
            volume: {
                $sum: '$qty'
            },
            open: {$first: "$$ROOT"},
            close: {$last: "$$ROOT"},
            high: {"$max": "$price"},
            low: {"$min": "$price"},
            price: {$first: '$price'},
            createdAt: {$first: '$createdAt'}
        })
        .project({
            _id: 'null',
            volume: '$volume',
            open: '$open.price',
            close: '$close.price',
            high: '$high',
            low: '$low',
            price: '$price',
            createdAt: '$createdAt'
        })
        .sort({createdAt: 1})
        .exec(function (err, data) {
            if (err) {
                callback(false, err);
                return false;
            }
            callback(true, data);
        });
};
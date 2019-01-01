var orderSchema = require('./schema/orders');
var paymentSchema = require('./schema/payments');
var currenciesSchema = require('./schema/currencies');

exports.getOrders = function (userId, req, callback) {
    var findArray = {};
    if (userId != null && userId != '') {
        findArray = {userId: mongoose.Types.ObjectId(userId)};
    }
    // if (req.body.id !== undefined && req.body.id !== '') {
    //     findArray['_id'] =  req.body.id;
    // }

    if (req.body.fromTotal !== undefined && req.body.toTotal !== undefined && req.body.fromTotal !== '' && req.body.toTotal !== '') {
        findArray['qty.total'] = {"$gte": Number(req.body.fromTotal), "$lte": Number(req.body.toTotal)};
    }
    if (req.body.fromRemain !== undefined && req.body.toRemain !== undefined && req.body.fromRemain !== '' && req.body.toRemain !== '') {
        findArray['qty.qtyRemain'] = {"$gte": Number(req.body.fromRemain), "$lte": Number(req.body.toRemain)};
    }

    if (req.body.fromSold !== undefined && req.body.toSold !== undefined && req.body.fromSold !== '' && req.body.toSold !== '') {
        findArray['qty.qtySold'] = {"$gte": Number(req.body.fromSold), "$lte": Number(req.body.toSold)};
    }
    if (req.body.orderType !== undefined && req.body.orderType !== '') {
        findArray['type'] = req.body.orderType;
    }
    if (req.body.fromPrice !== undefined && req.body.toPrice !== undefined && req.body.fromPrice !== '' && req.body.toPrice !== '') {
        findArray['price'] = {"$gte": Number(req.body.fromPrice), "$lte": Number(req.body.toPrice)};
    }
    if (req.body.orderFromDate !== undefined && req.body.orderToDate !== undefined && req.body.orderFromDate !== '' && req.body.orderToDate !== '') {
        var startDate = moment(req.body.orderFromDate).format("Y-MM-DD 00:00:00");
        var endDate = moment(req.body.orderToDate).format("Y-MM-DD 23:59:59");
        findArray['createdAt'] = {"$gte": startDate, "$lte": endDate};
    }

    if (req.body.status !== undefined && req.body.status !== '') {
        var val = req.body.status;
        val = val.split(",");
        findArray['status'] = {$in: val};
    }

    if (req.body.orderstatus !== undefined && req.body.orderstatus !== '') {
        findArray['status'] = req.body.orderstatus;
    }

    if (req.body.pair !== undefined && req.body.pair !== '') {
        findArray['pair'] = mongoose.Types.ObjectId(req.body.pair);
    }

    var sort = {createdAt: 1};
    if (req.body.order && req.body.order[0].column && req.body.order[0].dir) {
        var reqBody = req.body.order[0].column;
        sort = {[reqBody]: (req.body.order[0].dir == 'desc' ? -1 : 1)}
    }
    if (req.body.order_by != '' && req.body.order_dir) {
        var reqBody = req.body.order_by;
        sort = {[reqBody]: (req.body.order_dir == 'desc' ? -1 : 1)}
    }
    var query = orderSchema.find(findArray)
        .populate({path: 'primaryCurrencyId', select: 'symbol'})
        .populate({path: 'secondaryCurrencyId', select: 'symbol'})
        .populate({path: 'userId', select: 'email'});
    query.sort(sort);
    query.skip(Number(req.body.start));
    query.limit(Number(req.body.length));
    query.lean();
    query.exec(function (err, response) {
        if (err) {
            callback({status: false});
            return false;
        }
        getOrderCounts(findArray, function (count) {
            callback({status: true, data: response, total: count});
        })
    });
};

exports.getOrdersEX = function (condition, req, callback) {
    var sort = {createdAt: -1};
    var query = orderSchema.find(condition).populate({
        path: 'primaryCurrencyId',
        select: 'symbol name'
    }).populate({path: 'secondaryCurrencyId', select: 'symbol'}).populate({path: 'userId', select: 'email'});
    query.sort(sort);
    query.limit(10);
    query.lean();
    query.exec(function (err, response) {
        if (err) {
            callback({status: false});
            return false;
        }
        callback({status: true, data: response});
    });
};

exports.getTradeHistory = function (userId, req, callback) {
    var findArray = {userId: mongoose.Types.ObjectId(userId)};
    if (req.body.status !== undefined && req.body.status !== '') {
        findArray['status'] = Number(req.body.status);
    }
    orderSchema.aggregate([
        {
            $lookup: {
                from: 'payments',
                localField: '_id',
                foreignField: 'orderId',
                as: 'orderInfo'
            },
        },
        {
            $lookup: {
                from: 'payments',
                localField: '_id',
                foreignField: 'primaryOrderId',
                as: 'primaryOrderInfo'
            },
        },
        {
            $addFields: {
                "average": {$sum: "$orderInfo.rate"}, "average1": {$sum: "$primaryOrderInfo.rate"}
            }
        },
    ]).match(findArray).sort({createdAt: -1}).skip(Number(req.body.start)).limit(Number(req.body.length)).exec(function (err, data) {
        orderSchema.populate(data, [{path: 'primaryCurrencyId', select: 'symbol'}, {
            path: 'secondaryCurrencyId',
            select: 'symbol'
        }], function (err, response) {
            if (err) {
                callback({status: false});
                return false;
            }
            getOrderCounts(findArray, function (count) {
                callback({status: true, data: response, total: count});
            })

        })
    });
};

/*exports.tradeMarketChange = function (condition,callback) {
 try {
 orderSchema.aggregate()//createdAt:{$gt:new Date(Date.now() - 24*60*60 * 1000)}//.match({status: 2})
 .group({
 _id:'null',
 first: { $first: "$$ROOT" },
 last: { $last: "$$ROOT" }
 })
 .project({
 _id:'null',
 latestPrice : '$first.price',
 newPrice : '$first.price',
 previousPrice : '$last.price',//change : ((('$first.price'-'$last.price')/100)*100)
 }).exec(function (err,data) {
 if (err) {
 callback(false, err);
 return false;
 }
 callback(true, data)
 });
 }catch(err){
 callback(false, err);
 }
 }*/
getOrderCounts = function (whereCondition, callback) {
    orderSchema.find(whereCondition, function (err, result) {
        if (err) {
            callback(0);
            return false;
        }
        callback(result.length)
    });
};

/*exports.getTradeHistoryExchange = function (condition, callback) {
 orderSchema.aggregate([
 {
 $lookup: {
 from: 'payments',
 localField: '_id',
 foreignField: 'orderId',
 as: 'orderInfo'
 },
 },
 {
 $lookup: {
 from: 'payments',
 localField: '_id',
 foreignField: 'primaryOrderId',
 as: 'primaryOrderInfo'
 },
 },
 {
 $addFields: {
 "average": {$sum: "$orderInfo.rate"}, "average1": {$sum: "$primaryOrderInfo.rate"}
 }
 },
 ]).match(condition).sort({createdAt:1}).limit(20).exec(function (err, data) {
 orderSchema.populate(data, [{path: 'primaryCurrencyId', select: 'symbol'}, {
 path: 'secondaryCurrencyId',
 select: 'symbol'
 }], function (err, response) {
 if (err) {
 callback({status: false});
 return false;
 }
 callback({status: true, data: response});
 })
 });
 };*/

exports.getOrderByColumnName = function (condition, callback) {
    orderSchema.find(condition, function (err, result) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, result)
    })
};

exports.getOrderByColumnNameWithPopulate = function (condition, callback) {

    let query = orderSchema.find(condition).populate({
        path: 'primaryCurrencyId',
        select: 'symbol'
    }).populate({path: 'secondaryCurrencyId', select: 'symbol'});
    query.exec(function (err, response) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, response);
    });
};

exports.updateFieldByColumnName = function (updateField, userWhereField, callback) {
    orderSchema.update(userWhereField, {$set: updateField}, function (err, data) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};

exports.getOpenOrders = function (userId, req, callback) {
    var sort = {createdAt: 1};
    var query = orderSchema.find().populate({
        path: 'primaryCurrencyId',
        select: 'symbol'
    }).populate({path: 'secondaryCurrencyId', select: 'symbol'}).populate({path: 'userId', select: 'email'});
    query.sort(sort);
    query.exec(function (err, response) {
        if (err) {
            callback({status: false});
            return false;
        }
        callback({status: true, data: response});
    });
};

exports.getBuySellOrders = function (condition, sort, callback) {
    let sorting = {price: 1};
    if (sort == 'desc') {
        sorting = {price: -1};
    }
    // let query = orderSchema.find(condition).populate({path: 'primaryCurrencyId',select:'symbol'}).populate({path: 'secondaryCurrencyId', select:'symbol'}).populate({path: 'userId', select:'email'});
    // query.sort(sorting);
    // query.limit(20);
    // query.exec(function (err, response) {
    //     if (err) {
    //         callback({status: false});
    //         return false;
    //     }
    //     callback({status: true, data: response});
    // });

    orderSchema.aggregate()
        .match(condition)
        .group({
            _id: '$price',
            price: {$first: "$price"},
            total: {$sum: '$qty.qtyRemain'}
        })
        .sort(sorting)
        .limit(20)
        .exec(function (err, data) {
            if (err) {
                callback({status: false, err: err});
                return;
            }
            callback({status: true, data: data});
        });
};

exports._getOrder = (condition, callback, sort = {_id: 1}) => {
    try {
        orderSchema
            .findOne(condition)
            .sort(sort)
            .exec((err, getOrder) => {
                if (err) {
                    callback(false, 500, 'Failed to get order.');
                    return;
                }
                callback(true, 200, getOrder);
            });
    } catch (err) {
        callback(false, 500, 'Failed to get order');
    }
}

// exports.getOrderInfo = function (condition, callback) {
//     var query = orderSchema.find(condition).populate({path: 'primaryCurrencyId',select:'symbol name'}).populate({path: 'secondaryCurrencyId', select:'symbol name'});
//     query.exec(function (err, response) {
//         if (err) {
//             callback(false, err);
//             return false;
//         }
//         callback(true , response)
//     });
// }


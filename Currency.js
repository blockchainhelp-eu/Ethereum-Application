var availableCurrency = require('./schema/currencies');
exports.getCurrencyByCurrencyId = function (currencyId, callback) {
    availableCurrency.find({_id: currencyId}, function (err, currency) {
        if (err) {
            callback(err);
            return false;
        }
        if (!currency) {
            callback(err);
            return false;
        }
        callback(currency);
    });
};

exports.getBalances = function (id) {
    return new Promise((resolve, reject) => {
        var qry = availableCurrency
            .aggregate()
            .lookup({from: 'userBalances', localField: '_id', foreignField: 'currencyId', as: 'currencies'})
            .project({
                currency: "$name",
                trnFees: "$trnFees",
                status: "$status",
                symbol: "$symbol",
                balance: {
                    $filter: {
                        input: "$currencies",
                        as: "user_balance",
                        cond: {
                            $eq: ["$$user_balance.userId", mongoose.Types.ObjectId(id)]
                        }
                    }
                }
            })
            .sort({currency: 1});

        qry.exec(function (err, _mainToken) {
            if (err) {
                reject(err);
            }
            resolve(_mainToken);
        });
    });
};


currencyCount = function (condition, callback) {
    availableCurrency.count(condition, function (err, count) {
        if (err) {
            count = 0;
        }
        callback(count);
    });
};

exports.getCurrecyForBalance = function (symbol, callback) {
    availableCurrency.findOne({symbol: symbol}, function (err, currency) {
        if (err) {
            callback(err);
            return false;
        }
        callback(currency);
    });
};


exports.getCurrencyPromise = function (condition) {
    return availableCurrency.findOne(condition);
};
exports.getCurrenciesPromise = function (condition) {
    return availableCurrency.find(condition);
};

exports.getActiveCurrencies = function () {
    return availableCurrency.find({status: 1});
};

exports.getCurrency = function (condition, callback) {
    availableCurrency.find(condition, function (err, currency) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, currency);
    });
};
exports.getSingleCurrency = function (condition) {
    return new Promise((resolve,reject) => {
        availableCurrency.findOne(condition, function(err, currency) {
            if(err) {
                return reject(err);
            }
            return resolve(currency);
        });
    })

};

exports.getWhiteListCurrency = function (condition, callback) {
    availableCurrency.aggregate()
        .lookup({
            from: 'userSettings',
            localField: '_id',
            foreignField: 'whiteListAddress.currency',
            as: 'currencyInfo'
        })
        .project({
            name: "$name",
            symbolImage: "$symbolImage",
            _id: "$_id",
            symbol: "$symbol",
            balance: {
                $filter: {
                    input: "$currencyInfo",
                    as: "user_settings",
                    cond: {
                        $eq: ["$$user_settings.userId", condition]
                    }
                }
            }
        })
        .exec(function (err, currency) {
            if (err) {
                callback(false, err);
                return false;
            }
            callback(true, currency);
        })
};

exports.getCurrencyList = function (req, callback) {
    var findArray = {};
    if (req.body.name !== undefined && req.body.name !== '') {
        findArray['name'] = new RegExp(req.body.name, 'i');
    }
    if (req.body.symbol !== undefined && req.body.symbol !== '') {
        findArray['symbol'] = new RegExp(req.body.symbol, 'i');
    }
    if (req.body.primary !== undefined && req.body.primary !== '') {
        findArray['isPrimary'] = JSON.parse(req.body.primary);
    }
    if (req.body.status !== undefined && req.body.status !== '') {
        findArray['status'] = Number(req.body.status);
    }
    var sort = {createdAt: -1};
    if (req.body.order && req.body.order[0].column && req.body.order[0].dir) {
        var reqBody = req.body.order[0].column;
        sort = {[reqBody]: (req.body.order[0].dir == 'desc' ? -1 : 1)}
    }
    availableCurrency.aggregate([
        {
            $lookup: {
                from: 'exchangePairs',
                localField: '_id',
                foreignField: 'primaryCurrency',
                as: 'primaryPairInfo'
            },
        }
    ]).match(findArray).sort(sort).skip(Number(req.body.start)).limit(Number(req.body.length))
        .exec(function (err, currency) {
            if (err) {
                callback({status: false});
                return false;
            }
            currencyCount(findArray, function (count) {
                callback({status: true, data: currency, total: count});
            })
        });
};

exports.storeCurrency = function (data, callback) {
    var newCurrency = new availableCurrency(data);
    newCurrency.save(function (err, result) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, result);
    })
};

exports.checkCurrencyExist = function (condition, callback) {
    availableCurrency.findOne(condition, function (err, currency) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, currency);
    });
};

exports.updateCurrencyByColumnName = function (updateField, whereField, callback) {
    availableCurrency.update(whereField, {$set: updateField}, function (err, data) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};
var exchangePairsSchema = require('./schema/exchangePairs');

exports.storePair = function(data, callback){
var newPair = new exchangePairsSchema(data);
    newPair.save(function(err , result){
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, result);
    })
};

exports.checkPairExist = function(condition , callback){
    exchangePairsSchema.find(condition, function (err, pair) {
        if(err){
            callback(false, err);
            return false;
        }
        callback(true , pair);
    });
};
 // Working here.
exports.getPair = function(primaryCurrency, secondaryCurrency, callback){
    let condition = {};
    exchangePairsSchema.find(condition, function (err, pair) {
        if(err){
            callback(false, err);
            return false;
        }
        callback(true , pair);
    });
};

exports.getCurrencyPair = function(curId , req , callback){
    var findArray = {};
    findArray['primaryCurrency'] = mongoose.Types.ObjectId(curId);

    if (req.body.status !== undefined && req.body.status !== '') {
        findArray['status'] = Number(req.body.status);
    }
    if (req.body.primaryCurrency !== undefined && req.body.primaryCurrency !== '') {
        findArray['primaryCurrency'] = req.body.primaryCurrency;
    }
    if (req.body.secondaryCurrency !== undefined && req.body.secondaryCurrency !== '') {
        findArray['secondaryCurrency'] = req.body.secondaryCurrency;
    }

    var query = exchangePairsSchema.find(findArray).populate({path: 'primaryCurrency',select:'symbol'}).populate({path: 'secondaryCurrency', select:'symbol'})
    query.sort({createdAt: -1})
    query.skip(Number(req.body.start))
    query.limit(Number(req.body.length))
    query.lean()
    query.exec(function (err, response) {
        if (err) {
            callback({status: false});
            return false;
        }
        getPairCounts(findArray, function (count) {
            callback({status: true, data: response, total: count});
        })
    });
};

exports.getExchangeCurrencyPair = function(pair , callback){
    //var query = exchangePairsSchema.find()
}


getPairCounts = function(condition, callback){
    exchangePairsSchema.count(condition, function (err, count) {
        if (err) {
            count = 0;
        }
        callback(count);
    });
};

exports.updatePairByColumnName = function (updateField, whereField, callback) {
    exchangePairsSchema.update(whereField, {$set: updateField}, function (err, data) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};

exports.getAllCurrencyPair = function(condition ,callback){
    var query = exchangePairsSchema.find(condition)
        .populate({path: 'primaryCurrency',select:'symbol'})
        .populate({path: 'secondaryCurrency', select:'symbol'});
    query.exec(function(err, data){
        if (err) {
            // console.log(err);
            callback(false, err);
            return false;
        }
        //console.log(data[0].firstPayment, data[0].latestPayment,data[0].todayPayment)
        callback(true, data);
    })
}

exports.getAllCurrencyPairsPromise = function(condition){
    return exchangePairsSchema.find(condition).populate({path: 'primaryCurrency',select:'symbol'}).populate({path: 'secondaryCurrency', select:'symbol'}).exec();
};
var userBalanceSchema = require('./schema/userBalances');

exports.updateUserBalance = function (whereField, updateField, callback) {
    userBalanceSchema.updateOne(whereField, {$set: updateField}, function (err, data) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};


exports.increaseBalance = function (whereField, updateField) {
    return userBalanceSchema.updateOne(whereField, updateField);
};

exports.getUserBalanceByCurrency = function (id, curId, column, callback) {
    userBalanceSchema.findOne({userId: id, currencyId: curId}, function (err, result) {
        if (err) {
            callback(err);
            return false;
        }

        if (result) {
            if(column != '') {
                callback(result[column]);
                return false;
            }

            callback(result);
            return false;
        }

        callback(false);
        return false;

    });
};

exports.saveUserBalanceByCurrency = function (userId, curId, code) {
    var newBalance = new userBalanceSchema();
    newBalance.userId = userId;
    newBalance.currencyId = curId;
    newBalance.address = code;
    newBalance.save();  
};

exports.getHighestBalances = function(userId,callback){
    var query1 = userBalanceSchema.find({userId:userId , availableBalance:{ $gt: 0 }}).populate({path:'currencyId' , select:'symbol'}).limit(5).sort({availableBalance: -1});
    query1.exec(function (err,result) {
        if(err){
            callback(false , err);
            return false;
        }
        callback(true, result);
    })
};

exports.getUserBalance = function(userId ,req , callback){
    var findArray = {userId: userId};
    if (req.body.address !== undefined && req.body.address !== '') {
        findArray['address'] = new RegExp( req.body.address, 'i');
    }
    if (req.body.currency !== undefined && req.body.currency !== '') {
        findArray['currencyId'] = req.body.currency;
    }

    if (req.body.fromAvailable !== undefined && req.body.toAvailable !== undefined && req.body.fromAvailable !== '' && req.body.toAvailable !== '') {
        findArray['availableBalance'] = {"$gte": Number(req.body.fromAvailable), "$lte": Number(req.body.toAvailable)};
    }

    if (req.body.fromUnconfirmed !== undefined && req.body.toUnconfirmed !== undefined && req.body.fromUnconfirmed !== '' && req.body.toUnconfirmed !== '') {
        findArray['unconfirmedBalance'] = {"$gte": Number(req.body.fromUnconfirmed), "$lte": Number(req.body.toUnconfirmed)};
    }

    if (req.body.fromFrozen !== undefined && req.body.toFrozen !== undefined && req.body.fromFrozen !== '' && req.body.toFrozen !== '') {
        findArray['frozenBalance'] = {"$gte": Number(req.body.fromFrozen), "$lte": Number(req.body.toFrozen)};
    }

    if (req.body.balanceFromDate !== undefined && req.body.balanceToDate !== undefined && req.body.balanceFromDate !== '' && req.body.balanceToDate !== '') {
        var startDate = moment(req.body.balanceFromDate).format("Y-MM-DD 00:00:00");
        var endDate   = moment(req.body.balanceToDate).format("Y-MM-DD 23:59:59");
        findArray['updatedAt'] = {"$gte": startDate, "$lte": endDate};
    }
    var sort = {updatedAt:-1};
    if (req.body.order && req.body.order[0].column && req.body.order[0].dir) {
        var reqBody = req.body.order[0].column;
        sort = { [reqBody] :(req.body.order[0].dir == 'desc' ? -1 :1) }
    }

    var query1 = userBalanceSchema.find(findArray).populate({path:'currencyId' , select:'symbol'})
    query1.sort(sort)
    query1.skip(Number(req.body.start))
    query1.limit(Number(req.body.length))
    query1.lean()
    query1.exec(function (err,response) {
        if (err) {
            callback({status: false});
            return false;
        }
        getUserBalanceCounts(findArray, function (count) {
            callback({status: true, data: response, total: count});
        })
    })
};

getUserBalanceCounts =  function (whereCondition, callback) {
    userBalanceSchema.find(whereCondition, function (err, result) {
        if (err) {
            callback(0);
            return false;
        }
        callback(result.length)
    })
};

exports.updateFieldByColumnName = function (updateField, userWhereField, callback) {
    userBalanceSchema.update(userWhereField, updateField, function (err, data) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};

exports.getUserBalByColumnName = function (condition, callback) {
    var query1 = userBalanceSchema.find(condition).populate({path:'currencyId' , select:'symbol trnFees'})
    query1.exec(function (err,result) {
        if(err){
            callback(false , err);
            return false;
        }
        callback(true, result);
    });
}

exports.getUserAccountByAddressPromise = function (condition) {
    return new Promise((resolve,reject) => {
        var query = userBalanceSchema.find(condition).populate({
            path: 'currencyId',
            select: 'symbol'
        });

        query.exec(function (err, response) {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        });
    })

}

exports.getUserAccountByAddress = function (condition , callback) {
    var query = userBalanceSchema.find(condition).populate({
        path: 'currencyId',
        select: 'symbol'
    });

    query.exec(function (err, response) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, response);
    });
}

exports._balance = (condition,callback) =>{
    try{
        userBalanceSchema
            .findOne(condition)
            .populate('currencyId','symbol name')
            .exec((err,result) =>{
                if(err){
                    callback(false,500,'Failed to get currency balance.');
                    return;
                }
                callback(true,200,result);
            })
    }catch(err){
        callback(false,500,'Failed to get currency balance.');
    }
}
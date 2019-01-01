var loginHistorySchema = require('./schema/loginHistory');

exports.getHistory = function (userId, req, callback) {
    var findArray = {userId: mongoose.Types.ObjectId(userId)};
    // if (req.body.id !== undefined && req.body.id !== '') {
    //     findArray['_id'] = req.body.id;
    // }
    if (req.body.ip !== undefined && req.body.ip !== '') {
        findArray['ip'] = new RegExp(req.body.ip, 'i');
    }
    // if (req.body.isAuth !== undefined && req.body.isAuth !== '') {
    //     findArray['IsAuth'] =  req.body.isAuth;
    // }
    if (req.body.location !== undefined && req.body.location !== '') {
        findArray['location'] = new RegExp(req.body.location, 'i');
    }

    if (req.body.loginFromDate !== undefined && req.body.loginToDate !== undefined && req.body.loginFromDate !== '' && req.body.loginToDate !== '') {
        var startDate = moment(req.body.loginFromDate).format("Y-MM-DD 00:00:00");
        var endDate = moment(req.body.loginToDate).format("Y-MM-DD 23:59:59");
        findArray['createdAt'] = {"$gte": startDate, "$lte": endDate};
    }
    var sort = {createdAt: -1};
    if (req.body.order && req.body.order[0].column && req.body.order[0].dir) {
        var reqBody = req.body.order[0].column;
        sort = {[reqBody]: (req.body.order[0].dir == 'desc' ? -1 : 1)}
    }
    if (req.body.order_by != '' && req.body.order_dir) {
        var reqBody = req.body.order_by;
        sort = { [reqBody] :(req.body.order_dir == 'desc' ? -1 :1) }
    }
    var query = loginHistorySchema.find(findArray)
    query.sort(sort)
    query.skip(Number(req.body.start))
    query.limit(Number(req.body.length))
    query.lean()
    query.exec(function (err, response) {
        if (err) {
            callback({status: false});
            return false;
        }
        getUserLoginHistoryCounts(findArray, function (count) {
            callback({status: true, data: response, total: count});
        })
    });
};

getUserLoginHistoryCounts = function (whereCondition, callback) {
    loginHistorySchema.find(whereCondition, function (err, result) {
        if (err) {
            callback(0);
            return false;
        }
        callback(result.length)
    })
}

exports.storeHistory = function (req, id, auth, lc ,callback) {
    var newHistory = new loginHistorySchema();
    newHistory.userId = id;
    newHistory.agent = req.headers['user-agent'];
    newHistory.location = lc;
    newHistory.ip = req.ip;
    newHistory.IsAuth = auth;
    newHistory.save(function (err, result) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, result);
    });
};

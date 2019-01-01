var userHistorySchema = require('./schema/history');
exports.storeUserHistory = function(actionId ,userId, ip,callback){
    var newHistory = new userHistorySchema();
    newHistory.userId = userId;
    newHistory.historyType = actionId;
    newHistory.ip = ip;
    newHistory.save(function(err, result){
        if (err) {
            callback(false,err);
            return false;
        }
        callback(true,result);
    });
};
exports.getUserHistory = function(userId , req, callback){
    var findArray = {userId: mongoose.Types.ObjectId(userId)};

    if (req.body.ip !== undefined && req.body.ip !== '') {
        findArray['ip'] =  new RegExp(req.body.ip, 'i');
    }
    if (req.body.historyType !== undefined && req.body.historyType !== '') {
        findArray['historyType'] = req.body.historyType;
    }
    if (req.body.historyFromDate !== undefined && req.body.historyToDate !== undefined && req.body.historyFromDate !== '' && req.body.historyToDate !== '') {
        var startDate = moment(req.body.historyFromDate).format("Y-MM-DD 00:00:00");
        var endDate   = moment(req.body.historyToDate).format("Y-MM-DD 23:59:59");
        findArray['createdAt'] = {"$gte": startDate, "$lte": endDate};
    }
    var sort = {createdAt: -1};
    if (req.body.order && req.body.order[0].column && req.body.order[0].dir) {
        var reqBody = req.body.order[0].column;
        sort = { [reqBody] :(req.body.order[0].dir == 'desc' ? -1 :1) }
    }

    var query = userHistorySchema.find(findArray)
    query.sort(sort)
    query.skip(Number(req.body.start))
    query.limit(Number(req.body.length))
    query.lean()
    query.exec(function (err, response) {
        if (err) {
            callback({status: false});
            return false;
        }
        getUserHistoryCounts(findArray, function (count) {
            callback({status: true, data: response, total: count});
        })
    });
};
getUserHistoryCounts = function (whereCondition, callback) {
    userHistorySchema.find(whereCondition, function (err, result) {
        if (err) {
            callback(0);
            return false;
        }
        callback(result.length)
    })
}
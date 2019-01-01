var TransactionSchema = require('./schema/userTransactions');
var moment = require('moment');
var today = moment().startOf('day');
var tomorrow = moment(today).add(1, 'days');

exports.getSumOfTrans = function (userId, type, status, callback) {
    TransactionSchema
        .aggregate()  // verified by uttam
        .match({
            userId: userId,
            type: {$in: type},
            status: {$in: status},
            createdAt: {
                $gte: today.toDate(),
                $lt: tomorrow.toDate()
            }
        })
        .group({
            _id: null,
            total: {
                $sum: "$amountUsd"
            }
        }).exec(function (err, result) {
        if (err) {
            callback(err);
            return false;
        }
        callback(result);
    });
};

// exports.getTransactionData = function (condition, callback) {
//     var query = TransactionSchema.aggregate([
//         {
//             $lookup: {
//                 from: 'userBalances',
//                 localField: 'userId',
//                 foreignField: 'userId',
//                 as: 'balanceInfo'
//             }
//         },
//     ]).match(condition).exec(function (err, data) {
//         if (err) {
//             callback(false, err);
//             return false;
//         }
//         callback(true, data);
//     });
//
// };

exports.getTransactionData = function (condition, callback) {

    var query = TransactionSchema.find(condition).populate({path: 'userId'}).populate({path: 'currencyId',
        select: 'symbol'});
    query.exec(function (err, response) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, response);
    });
};

exports.getPendingDeposits = function() {
    return TransactionSchema.find({type: 2, status: 0});
};


exports.getPendingTransaction = function (condition, callback) {
    var query = TransactionSchema.find(condition).populate({
        path: 'currencyId',
        select: 'symbol'
    })
    // .populate({path: 'userId', select: 'email'}) //N-I think it should not be required bcz not use
    query.exec(function (err, response) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, response);
    });
}

exports.getTransaction = function (userId, req, callback) {
    var findArray = {};
    if (userId != '') {
        findArray = {userId: mongoose.Types.ObjectId(userId)};
    }
    if (req.body.type !== undefined && req.body.type !== '') {
        findArray['type'] = req.body.type;
    }
    if (req.body.status !== undefined && req.body.status !== '') {
        var val = req.body.status;
        val = val.split(",");
        findArray['status'] = {$in: val};
    }
    if (req.body.defaultstatus !== undefined && req.body.defaultstatus !== '') {
        findArray['status'] = req.body.defaultstatus;
    }
    if (req.body.inprocess !== undefined && req.body.inprocess !== '') {
        findArray['inProcess'] = req.body.inprocess;
    }
    if (req.body.adminapproved !== undefined && req.body.adminapproved !== '') {
        findArray['adminApproved'] = req.body.adminapproved;
    }
    if (req.body.transactionFromDate !== undefined && req.body.transactionToDate !== undefined && req.body.transactionFromDate !== '' && req.body.transactionToDate !== '') {
        var startDate = moment(req.body.transactionFromDate).format("Y-MM-DD 00:00:00");
        var endDate = moment(req.body.transactionToDate).format("Y-MM-DD 23:59:59");
        findArray['createdAt'] = {"$gte": startDate, "$lte": endDate};
    }

    if (req.body.txAddress !== undefined && req.body.txAddress !== '') {
        findArray['address'] = new RegExp(req.body.txAddress, 'i');
    }

    if (req.body['filter-currency'] !== undefined && req.body['filter-currency'] !== '') {
        findArray['currencyId'] = req.body['filter-currency'];
    }

    if (req.body.txId !== undefined && req.body.txId !== '') {
        findArray['txId'] = new RegExp(req.body.txId, 'i');
    }
    if (req.body.email !== undefined && req.body.email !== '') {
        findArray['$and'] = [{"userId.email": req.body.email}];
    }
    if (req.body.fromAmount !== undefined && req.body.toAmount !== undefined && req.body.fromAmount !== '' && req.body.toAmount !== '') {
        findArray['amount'] = {"$gte": Number(req.body.fromAmount), "$lte": Number(req.body.toAmount)};
    }
    if (req.body.fromFee !== undefined && req.body.toFee !== undefined && req.body.fromFee !== '' && req.body.toFee !== '') {
        findArray['txFee'] = {"$gte": Number(req.body.fromFee), "$lte": Number(req.body.toFee)};
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
    var query = TransactionSchema.find(findArray).populate({
        path: 'currencyId',
        select: 'symbol'
    }).populate({path: 'userId', select: 'email'})
    query.sort(sort)
    query.skip(Number(req.body.start))
    query.limit(Number(req.body.length))
    query.lean()
    query.exec(function (err, response) {
        if (err) {
            callback({status: false});
            return false;
        }
        getTransactionCountsInternal(findArray, function (count) {
            console.log('test count',count);
            callback({status: true, data: response, total: count});
        })
    });
};
getTransactionCountsInternal = function (whereCondition, callback) {
    TransactionSchema.find(whereCondition, function (err, result) {
        if (err) {
            callback(0);
            return false;
        }
        callback(result.length)
    })
};
exports.getTransactionCounts = function (whereCondition, callback) {
    TransactionSchema.find(whereCondition, function (err, result) {
        if (err) {
            callback(0);
            return false;
        }
        callback(result.length)
    })
};

exports.updateTransaction = function (trnIds, updateField, callback) {
    TransactionSchema.updateMany({_id: {$in: trnIds}}, {$set: updateField}, function (err, response) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, response);
    });
};

exports.updateTransactionPromise = function (trnId, updateField) {
    return TransactionSchema.updateOne({_id: trnId}, {$set: updateField});
};

exports.updateFieldByColumnName = function (updateField, userWhereField, callback) {
    TransactionSchema.updateMany(userWhereField, {$set: updateField}, function (err, data) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};
exports.storeUserTransactionPromise = function (trnData) {
    var newUserWithdraw = new TransactionSchema(trnData);
    return newUserWithdraw.save();
};
exports.storeUserTransaction = function (trnData, callback) {
    var newUserWithdraw = new TransactionSchema(trnData);
    newUserWithdraw.save(function (err, result) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, result);
    });
};

exports._demo = (data, callback) => {

    const Transaction = require('mongoose-transactions')


    const transaction = new Transaction();
    const txn = "user_transactions" // the name of the registered schema

    const user = 'users';

    const jonathanObject = {
        amount: 99999
    }

    const aliceObject = {
        amount: 987987
    }

    async function start() {
        try {
            const jonathanId = transaction.insert(txn, jonathanObject);
            transaction.update(txn, jonathanId, aliceObject)
            transaction.update(user, '5ae01da80c23ff24df368bb1', {email: 'kdmakwana43@gmail.com'})
            transaction.update(user, '5ae01da80c23ff24df368bb1', {status: 25})
            transaction.update(user, '5ae1a9e48511b44dac6ea1d2', {status: 35})
            // transaction.remove(txn,) // this operation fail
            const final = await transaction.run()
            // expect(final[0].name).toBe('Jonathan')
        } catch (error) {
            console.error('error')
            const rollbackObj = await transaction.rollback().catch(console.error)
            transaction.clean()
        }
    }

    start()

    /* s = new TransactionSchema({
     amount : 321
     });

     s.save();

     d(s);*/

    // var userSchema = require('../models/schema/users');


    /*Promise.all([
     userSchema.update({_id : '5ae01da80c23ff24df368bb1'},{status : 1}),
     userSchema.findOne({_id : '5ae1a9e48511b44dac6ea1d2xx'}),
     ])
     .then(([user1,user2]) =>{
     d(user1)
     d(user2)
     })
     .catch((err) =>{
     d(err,0);
     });*/


    // db.db.command('beginTransaction');
    // var txn = new TransactionSchema({amount: 456});
    // txn.save();


    /*var Fawn = require("fawn");
     Fawn.init(mongoose);

     var transaction = Fawn.Task();
     var txn = new TransactionSchema({amount: 123});
     transaction
     .update("users", {email: "testnestcode@gmail.com"},{$inc: {status: -20}})
     .update("users", {email: 'kdmakwana43@gmail.com'}, {$inc: {status: 'asfasfasffasf'}})
     .run()
     .then(function(results){
     var firstUpdateResult = results[0];
     var secondUpdateResult = results[1];
     console.log(secondUpdateResult);
     })
     .catch(function(err){
     // Everything has been rolled back.
     console.log(err);
     });*/

    // var updateData = {
    //     amount : 500
    // }

    // var query1;
    // var query2;
    // var query3;

    // var transaction = new TransactionSchema();
    // transaction.amount  = 10.000;


    // getUser('5ae1a9e48511b44dac6ea1d2')
    // .then((user1) => {
    //   /*  UPDATE USER 1 STATUS */
    //     user1.status = 20000;
    //     query1 = users1;
    //     return getUser('5ae01da80c23ff24df368bb1');
    // })
    // .then((user2) => {
    //     /* UPDATE USER 2 */
    //     user2.status = 1000;
    //     query2 = user2;
    //     return getHistory('5ae1955dab719d3867dfd576');
    // })
    // .then((loginHistory) =>{
    //     loginHistory.IsAuth = 150;
    //     query3 = loginHistory;
    //     return runQuery(query1,query2,query3);
    // })
    // .then((success) =>{

    // })
    // .catch((err) =>{
    //     d(err,0);
    // });
}

getUser = function (id) {
    //5ae1a9e48511b44dac6ea1d2

    //
    var userSchema = require('../models/schema/users');
    return new Promise((resolve, reject) => {
        UsersModel.getUser(id, (users) => {
            if (users === null) {
                reject('user not exist');
                return;
            }
            resolve(users);
        });
    });
}

getHistory = function (id) {
    var loginHistorySchema = require('./schema/loginHistory');
    return new Promise((resolve, reject) => {
        loginHistorySchema.findOne({id: id}, (err, history) => {
            if (err) {
                d(err, 0);
                reject(err.message);
                return;
            }
            resolve(history);
        });
    });
}

runQuery = function (query1, query2, query3) {
    return new Promise((resolve, reject) => {
        /* SAVE 1 */
        query1.save((err, saved) => {
            d(err, 0);
            return;
        });

        query2.save((err, saved) => {
            d(err, 0);
            return;
        });

        query3.save((err, saved) => {
            d(err, 0);
            return;
        });
    });
}
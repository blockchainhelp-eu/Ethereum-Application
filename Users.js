var userSchema = require('./schema/users');
var userSettingSchema = require('./schema/userSettings');

exports.login = function (data, req, callback) {
    try {
        var email = data.emailId;

        userSchema.findOne({email: email}, function (err, user) {
            if (err) {
                callback(false, 'error', 'Something went wrong!');
                return false;
            }

            if (!user) {
                callback(false, 'error', 'Email or password wrong!');
                return false;
            }

            if (!globalFunctions.comparePass(data.password, user.password)) {
                callback(false, 'error', 'Invalid password!');
                return false;
            }

            if (user.status == 0) {
                callback(false, 'error', 'Email not verified!');
                return false;
            }

            if (user.status == 2) {
                callback(false, 'error', 'Your account is blocked!');
                return false;
            }

            userSettingSchema.findOne({userId: user._id}, function (err, userSecret) {
                if (err) {
                    callback(false, 'error', 'Something went wrong!');
                    return false;
                }
                callback(true, 'success', [user, userSecret]);
                return false;
            });
        });
    }
    catch (err) {
        callback(false, 'error', 'Something went wrong!');
        return false;
    }
};

exports.adminLogin = function (req, callback) {
    try {
        userSchema.findOne({email: req.body.emailId}, function (err, user) {
            if (err) {
                callback(false, 'error', 'Something went wrong!');
                return false;
            }
            if (!user) {
                callback(false, 'error', 'Email or password wrong!');
                return false;
            }
            if (!globalFunctions.comparePass(req.body.password, user.password)) {
                callback(false, 'error', 'Invalid password!');
                return false;
            }
            userSchema.findOne({email: req.body.emailId}, function (err, userSecret) {
                if (err) {
                    callback(false, 'error', 'Something went wrong!');
                    return false;
                }
                callback(true, 'success', userSecret);
                return false;
            });
        });
    }
    catch (err) {
        callback(false, 'error', 'Something went wrong!');
        return false;
    }
};

exports.changePassword = function (user_id, data, req, callback) {
    try {
        var newPass = globalFunctions.encryptPassword(data.new_pass);
        userSchema.update({_id: user_id}, {$set: {password: newPass}}, function (err, result) {
            if (err) {
                callback(false, 'error', 'Failed to change password');
                return false;
            }
            callback(true, 'success', 'Change password successfully');
            return false;
        });
    }
    catch (err) {
        callback(false, 'error', 'Something went wrong!');
        return false;
    }
};

exports.userRegister = function (data, ip, callback) {
    var newUser = new userSchema();
    newUser.email = data.email;
    newUser.ip = ip;
    newUser.password = globalFunctions.encryptPassword(data.password);
    newUser.save(function (err, result) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, result);
    });
};

exports.uploadProof = function(data, userId , callback){
    userSchema.findOne({_id: userId}, function (err, user) {
        user.userVerification.verifiedLevel = data.verifiedLevel;
        user.userVerification.canEdit = data.canEdit;
        user.userVerification.documents = data.documents;
        user.save(function (err, result) {
            if (err) {
                callback(false, err);
                return false;
            }
            callback(true, result);
        });
    });
}

exports.getUserByEmail = function (email, callback) {
    userSchema.findOne({email: email}, function (err, user) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, user);
    });
};

exports.getUserPromise = function (user_id) {
    return new Promise ((resolve, reject) => {
        userSchema.findOne({_id: user_id}, function (err, user) {
            if (err) {
                return reject(err);
            }
            return resolve(user);
        });
    })

};

exports.getUser = function (user_id, callback) {
    userSchema.findOne({_id: user_id}, function (err, user) {
        if (err) {
            callback(err);
            return false;
        }
        callback(user);
        return false;
    });
};

exports.getUsers = function(callback){
    userSchema.find(function(err , user){
    if(err){
        callback(false , err);
        return false;
    }
    callback(true , user);
    });
}

exports.getUserByColumnName = function (condition, callback) {
     userSchema.find(condition , function(err, user) {
            if (err) {
                callback(false, err);
                return false;
            }
            callback(true, user);
        });
}

exports.getUserByColumnNameWithAggregate = function (condition, callback) {
    var query = userSchema.aggregate([{
        $lookup: {
            from: 'userBalances',
            localField: '_id',
            foreignField: 'userId',
            as: 'balanceInfo'
        },
    }]).match(condition)
        .exec(function (err, user) {
            if (err) {
                callback(false, err);
                return false;
            }
            callback(true, user);
        });
}

exports.updateFieldByColumnName = function (updateField, userWhereField, callback) {
    userSchema.update(userWhereField, updateField, function (err, data) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};


exports.addDocuments = function (pushField, userId, callback) {
    userSchema.findOne({_id: userId})
        .exec(function (err, user) {
            if (err) {
                callback(err);
                return false;
            }
            user.userVerification.documents.push(pushField);
            user.save();
            callback(true);
            return false;
        });
};

exports.getAllusers = function (req, callback) {
    var findArray = {}
    var sort = {createdAt: -1};
    if (req.body.email !== undefined && req.body.email !== '') {
        findArray['email'] = new RegExp(req.body.email, 'i');
    }
    if (req.body.status !== undefined && req.body.status !== '') {
        findArray['status'] = req.body.status;
    }

    if (req.body.defaultstatus !== undefined && req.body.defaultstatus !== '') {
        findArray['status'] = req.body.defaultstatus;
    }
    if (req.body.verifiedlevel !== undefined && req.body.verifiedlevel !== '') {
        findArray['userVerification.verifiedLevel'] = req.body.verifiedlevel;
    }


    if (req.body.ip !== undefined && req.body.ip !== '') {
        findArray['ip'] = new RegExp(req.body.ip, 'i');
    }
    if (req.body.order && req.body.order[0].column && req.body.order[0].dir) {
        var reqBody = req.body.order[0].column;
        sort = {[reqBody]: (req.body.order[0].dir == 'desc' ? -1 : 1)}
    }
    var query = userSchema.find(findArray)
    query.skip(Number(req.body.start))
    query.limit(Number(req.body.length))
    query.sort(sort)
    query.lean()
    query.exec(function (err, response) {
        if (err) {
            callback({status: false});
            return false;
        }
        getUsersCounts(findArray, function (count) {
            callback({status: true, data: response, total: count});
        })
    });
}
getUsersCounts = function (whereCondition, callback) {
    userSchema.count(whereCondition, function (err, count) {
        if (err) {
            count = 0;
        }
        callback(count);
    });
};

exports.updateUserLevel = function(userId, level , callback){
    userSchema.findOne({_id: userId}, function (err, result) {
        result.userVerification.verifiedLevel = level;
        result.updatedAt = Date.now();
        result.save(function (err) {
            if(err){
              callback(false, err);
            }
            callback(true);
        });
    });
}






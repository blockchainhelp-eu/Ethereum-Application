var userSettings = require('./schema/userSettings');
exports.storeUserSettings = function (data, callback) {
    var storeUserSettings = new userSettings(data);
    storeUserSettings.save(function (err, result) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, result);
    });
};

exports.updateUserSecurityByColumnName = function (updateField, userWhereField, callback) {

    userSettings.update(userWhereField, {$set: updateField}, {multi: true}, function (err, data) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};

exports.updateUserNotification = function (user_id, field, value, callback) {
    userSettings.findOne({userId: user_id}, function (err, result) {
        result.notifications[field] = value;
        result.updatedAt = Date.now();
        result.save(function (err) {
            callback(true);
        });
    });
};

exports.tmp_key = function (user_id, secret, callback) {
    userSettings.findOne({userId: user_id}, function (err, result) {
        result.googleAuth.authSecret = secret;
        result.save(function (err) {
            callback(true);
        });
    });
};

exports.storePublicKey = function (user_id, pubkey, callback) {
    userSettings.findOne({userId: user_id}, function (err, result) {
        result.emailEnc.emailEncPubKey = pubkey;
        result.save(function (err) {
            callback(true);
        });
    });
};

exports.getUserSec = function (user_id, populate = false, callback) {
    var query = userSettings
        .findOne({userId: user_id});
    if (populate == true) {
        query.populate('userId');
    }
    query.exec(function (err, user) {
        if (err) {
            callback(err);
            return false;
        }
        callback(user);
    });
};

exports.updatePublicKeyStatus = function (user_id, data, callback) {
    userSettings.findOne({userId: user_id}, function (err, result) {
        result.emailEnc.isEmailEnc = data.status;
        if (data.pubkey !== undefined) {
            result.emailEnc.emailEncPubKey = data.pubkey;
        }
        result.updatedAt = data.updatedAt;
        result.save(function (err) {
            callback(true);
        });
    });
};

exports.getUserSettings = function (callback) {
    userSettings.find(function (err, settings) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, settings);
    });
}
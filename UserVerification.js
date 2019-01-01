var userVerificationSchema = require('./schema/userVerification');

exports.storeVerificationLink = function(verificationdata, callback){
    var newVerificationLink = new userVerificationSchema(verificationdata);
    newVerificationLink.save(function(err, result){
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true ,result);
    });
};

exports.getVerificationByColumn = function (whereFields , callback) {
    userVerificationSchema.find({$and:whereFields}, function (err ,user) {
        if (err) {
            callback(false,err);
            return false;
        }
        callback(true ,user);
    });
};
exports.updateFieldByColumnName = function (updateField, whereField, callback) {
    userVerificationSchema.update(whereField, {$set: updateField}, function (err, data) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};
exports.deleteRowByColumnName = function(whereField, callback){
    userVerificationSchema.remove(whereField ,function (err,data){
        if(err){
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};
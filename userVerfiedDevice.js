var userVerifiedDeviceSchema = require('./schema/userVerifiedDevice');
exports.storeDevice = function(data,callback){
    var newStoreDevice = new userVerifiedDeviceSchema(data);
    newStoreDevice.save(function (err, result) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, result);
    });
};

var siteSettingsSchema = require('./schema/siteSettings');

exports.updateFieldByColumnName = function (updateField, userWhereField, callback) {
    siteSettingsSchema.update(userWhereField , updateField, function (err, data) {;
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, data);
    });
};

exports.getSettings = function (condition, callback) {
    siteSettingsSchema.find(condition, function (err, result) {
        if (err) {
            callback(false, err);
            return false;
        }
        callback(true, result);
    });
};
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var siteSettingsSchema= new Schema({
    parameter: {
        type: String
    },
    value: {
        type: String
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    updatedAt: {
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('siteSettings',siteSettingsSchema,'siteSettings');

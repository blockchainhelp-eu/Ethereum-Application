var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSettingsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,ref:'users'
    },
    emailEnc: {
        isEmailEnc: {
            type: Boolean,
            default: false
        },
        emailEncPubKey: {
            type: String,
            default: null
        },
    },
    googleAuth: {
        isAuth: {
            type: Boolean,
            default: false
        },
        authSecret: {
            type: String,
            default: ""
        },
    },
    monitorWithdrawals: {
        type: Boolean,
        default: true
    },
    lockWithdrawals:{
        type: Boolean,
        default: false
    },
    customWithdrawals: {
        isActive: {
            type: Boolean,
            default: false
        },
        secret: {
            type: String,
            default: ""
        }
    },
    destroySessions: {
        type: Boolean,
        default: false
    },
    loginNotify:{
        type: Boolean,
        default: true
    },
    newIpDetection:{
        type: Boolean,
        default: false
    },
    ipWhitelist:{
        isActive: {
            type: Boolean,
            default: false
        },
        ipList: {
            type: Array,
            default: null
        }
    },
    whiteListAddress :[{
        currency : {
            type: Schema.Types.ObjectId,ref:'currencies'
        },
        addresses: {
            type: Array ,
            default: null
        },
        withdrawStatus:{
            type: Boolean,
            default: false
        },
        withdrawTime: {
            type : Date,
            default : Date.now
        }
    }],
    notifications: {
        withdrawComplete: {
            type: Boolean,
            default: false
        },
        depositArrive: {
            type: Boolean,
            default: false
        },
        depositComplete: {
            type: Boolean,
            default: false
        },
        changePassword: {
            type: Boolean,
            default: false
        }
    },
    createdAt: {
        type : Date,
        default : Date.now
    },
    updatedAt: {
        type : Date,
        default : Date.now
    }

});
module.exports = mongoose.model('userSettings',userSettingsSchema, 'userSettings');
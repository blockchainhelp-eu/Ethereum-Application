var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dataTables = require('mongoose-datatables');
var userSchema = new Schema({
    firstName: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        unique: true
    },
    dob: {
        type: String,
        default: ""
    },
    password: String, // Encrypted
    status: {
        type: Number,
        default: 0 // 0 Pending | 1 Active | 2 Locked
    },
    userType: {
        type: Number,
        default: 1 // 1 User | 2 Admin
    },
    phoneNumber: {
        type: String,
        default: ""
    },
    address: {
        address: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        state: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: ""
        },
        postalCode: {
            type: String,
            default: ""
        }
    },
    userVerification: {
        verifiedLevel: {
            type: Number,
            default: 0
        },
        canEdit: {
            type: Number,
            default: 1
        },
        documents: [{
            documentType: String,
            document: String
        }]
    },
    ip: {
        type: String,
        default: ""
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
userSchema.plugin(dataTables);


module.exports = mongoose.model('users', userSchema);
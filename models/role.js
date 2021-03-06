module.exports = (function () {
    'use strict';

    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var roleSchema = new Schema({
        name: {type: String, trim: true, lowercase: true, index: true, unique: true, required: true},
        description: {type: String, required: false},
        resources: [{type: Schema.Types.ObjectId, ref: 'Resource'}]
    });

    roleSchema.statics.getResources = function (role, cb) {
        this.findOne({name: role})
            .populate('resources')
            .exec(function (err, roles) {
                if (err) {
                    return cb(err);
                }
                if (!roles) {
                    return cb(null, []);
                }
                cb(null, roles.resources);
            });
    };

    roleSchema.statics.getRoles = function (cb) {
        this.find({}, function (err, roles) {
            if (err) {
                return cb(err);
            }
            if (!roles) {
                return cb(null, []);
            }
            cb(null, roles);
        });
    };

    return mongoose.model('Role', roleSchema);
})();
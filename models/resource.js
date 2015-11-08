module.exports = (function(){
    'use strict';

    var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

    var resourceSchema = new Schema({
        path: {type: String, trim: true, index: true, unique: true, required: true},
        description: {type: String, required: false}
    });

    resourceSchema.statics.getResources = function (cb) {
        this.find({}, function (err, resources) {
            if (err) {
                return cb(err);
            }
            if (!resources) {
                return cb(null, []);
            }
            cb(null, resources);
        });
    };

    return mongoose.model('Resource', resourceSchema);
})();

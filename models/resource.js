var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var resourceSchema = new Schema({
    path: {type: String, trim: true, index: true, unique: true, required: true},
    description: {type: String, required: false}
});

module.exports = mongoose.model('Resource', resourceSchema);
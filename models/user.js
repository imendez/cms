module.exports = (function () {
    'use strict';

    var role = require('../models/role');

    var mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        bcrypt = require('bcrypt'),
        resource = require('../models/resource'),
        SALT_WORK_FACTOR = 10,
        MAX_LOGIN_ATTEMPTS = 5,
        LOCK_TIME = 5 * 60 * 1000; //5 minutos

    var userSchema = new Schema({
        username: {type: String, trim: true, lowercase: true, index: true, unique: true, required: true},
        password: {type: String, index: true, required: true},
        email: {type: String, validate: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i, required: true, unique: true},
        loginAttempts: {type: Number, required: true, default: 0},
        lockUntil: {type: Number},
        roles: [{type: Schema.Types.ObjectId, ref: 'Role'}]
    });

    userSchema.pre('save', function (next) {
        var user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) {
            return next();
        }

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) {
                return next(err);
            }

            // hash the password along with our new salt
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }

                // override the cleartext password with the hashed one
                user.password = hash;
                return next();
            });
            return null;
        });
        return null;
    });

    userSchema.virtual('isLocked').get(function () {
        // check for a future lockUntil timestamp
        return !!(this.lockUntil && this.lockUntil > Date.now());
    });

    userSchema.methods.comparePassword = function (candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
            if (err) {
                return cb(err);
            }
            return cb(null, isMatch);
        });
    };

    userSchema.methods.incLoginAttempts = function (cb) {
        // if we have a previous lock that has expired, restart at 1
        if (this.lockUntil && this.lockUntil < Date.now()) {
            return this.update({
                $set: {loginAttempts: 1},
                $unset: {lockUntil: 1}
            }, cb);
        }
        // otherwise we're incrementing
        var updates = {$inc: {loginAttempts: 1}};
        // lock the account if we've reached max attempts and it's not locked already
        if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
            updates.$set = {lockUntil: Date.now() + LOCK_TIME};
        }
        return this.update(updates, cb);
    };

// expose enum on the model, and provide an internal convenience reference
    var reasons = userSchema.statics.failedLogin = {
        NOT_FOUND: 0,
        PASSWORD_INCORRECT: 1,
        MAX_ATTEMPTS: 2
    };

    userSchema.statics.authenticate = function (username, password, cb) {
        this.findOne({username: username}, function (err, user) {
            if (err) {
                return cb(err);
            }

            // make sure the user exists
            if (!user) {
                return cb(null, null, reasons.NOT_FOUND);
            }

            // check if the account is currently locked
            if (user.isLocked) {
                // just increment login attempts if account is already locked
                return user.incLoginAttempts(function (err) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, null, reasons.MAX_ATTEMPTS);
                });
            }

            // test for a matching password
            user.comparePassword(password, function (err, isMatch) {
                if (err) {
                    return cb(err);
                }

                // check if the password was a match
                if (isMatch) {
                    // if there's no lock or failed attempts, just return the user
                    if (!user.loginAttempts && !user.lockUntil) {
                        return cb(null, user);
                    }
                    // reset attempts and lock info
                    var updates = {
                        $set: {loginAttempts: 0},
                        $unset: {lockUntil: 1}
                    };
                    return user.update(updates, function (err) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null, user);
                    });
                }

                // password is incorrect, so increment login attempts before responding
                user.incLoginAttempts(function (err) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, null, reasons.PASSWORD_INCORRECT);
                });
                return null;
            });
            return null;
        });
    };

    userSchema.statics.findUser = function (query, cb) {
        this.findOne(query)
            .populate({path: 'roles', model: role})
            .exec(function (err, user) {
                if (err) {
                    return cb(err);
                }

                if (!user) {
                    return cb(null, null);
                }
                var options = {path: 'roles.resources', model: resource};
                user.populate(options, function (err, user) {
                    cb(null, user);
                });
            });
    };

    userSchema.statics.getUsers = function (cb) {
        this.find({}, {_id: 1, username: 1, email: 1, roles: 1})
            .populate({path: 'roles', model: role})
            .exec(function (err, users) {
                if (err) {
                    return cb(err);
                }
                cb(null, users);
            });
    };

    return mongoose.model('User', userSchema);

})();
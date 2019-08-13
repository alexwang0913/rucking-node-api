const mongoose = require('mongoose')
const crypto = require('crypto')
const bcrypt = require('bcrypt-nodejs')

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    userId: { type: String, required: true, unique: true },
    age: Number,
    weight: Number,
    height: Number,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.pre('save', function (next) {
    const user = this
    const SALT_FACTOR = 5

    if (!user.isModified('password')) return next()

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) return next(err)

        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return next(err)
            user.password = hash
            next()
        })
    })
})

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

module.exports = mongoose.model('users', userSchema)
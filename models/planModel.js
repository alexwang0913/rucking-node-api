const mongoose = require('mongoose')
const planSchema = new mongoose.Schema({
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'workouts' },
    planDate: Date,
    createdAt: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
})

module.exports = mongoose.model('plans', planSchema)
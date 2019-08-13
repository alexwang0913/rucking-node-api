const mongoose = require('mongoose')

const workoutHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
    workoutId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'workouts' },
    distance: Number,
    calorieBurn: Number,
    seconds: Number,
    startTime: Date,
    endTime: Date,
    routes: String,
    pace: String,
    progress: Number
})

module.exports = mongoose.model('workoutHistories', workoutHistorySchema)
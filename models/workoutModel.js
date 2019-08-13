const mongoose = require('mongoose')

const workoutSchema = new mongoose.Schema({
    name: String,
    description: { type: String, default: "" },
    setList: [{
        name: String,
        count: Number,
        mode: Number // 1: Exercise, 0: Running
    }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now },
    isShared: { type: Boolean, default: false },
    setCount: Number
})

module.exports = mongoose.model('workouts', workoutSchema)
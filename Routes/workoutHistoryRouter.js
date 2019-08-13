const express = require('express')
const WorkoutHistory = require('../models/workoutHistoryModel')
const router = express.Router()
const mongoose = require('mongoose')


router.route('/add')
    .post((req, res) => {
        const workoutHistory = req.body
        new WorkoutHistory(workoutHistory).save().then(result => {
            res.send({ msg: 'success' })
        }).catch(error => {
            res.status(500).send({ msg: error.message })
        })
    })
router.route('/list/:userId')
    .get((req, res) => {
        const { userId } = req.params
        WorkoutHistory.aggregate(
            [{
                "$match": {
                    "userId": mongoose.Types.ObjectId(userId)
                }
            },
            {
                "$lookup": {
                    "from": "workouts",
                    "localField": "workoutId",
                    "foreignField": "_id",
                    "as": "workout"
                }
            },
            {
                "$project": {
                    "date": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$startTime"
                        }
                    },
                    "workout": "$workout.name",
                    "id": "$_id"
                }
            },
            {
                "$unwind": {
                    "path": "$workout"
                }
            },
            {
                "$group": {
                    "_id": "$date",
                    "workouts": {
                        "$push": "$workout"
                    },
                    "ids": {
                        "$push": "$id"
                    }
                }
            }],
            function (err, result) {
                if (err) return res.status(500).send({ msg: err.message })
                res.send({ history: result })
            }
        )
    })
router.route('/:id')
    .get((req, res) => {
        const { id } = req.params
        WorkoutHistory.findById(id).populate('workoutId').then(history => {
            res.send({ history: history })
        }).catch(error => {
            res.status(500).send({ msg: error.message })
        })
    })
module.exports = router
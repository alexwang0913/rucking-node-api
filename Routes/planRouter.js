const express = require('express')
const Plan = require('../models/planModel')
const mongoose = require('mongoose')
const router = express.Router()

router.route('/add')
    .post((req, res) => {
        new Plan(req.body).save().then(result => {
            res.send({ msg: 'success in save plan' })
        }).catch(error => {
            res.status(500).send({ msg: error.message })
        })
    })
router.route('/list')
    .post((req, res) => {
        const { userId } = req.body
        Plan.aggregate([
            {
                "$match": {
                    "user": mongoose.Types.ObjectId(userId)
                }
            },
            {
                "$lookup": {
                    "from": "workouts",
                    "localField": "workout",
                    "foreignField": "_id",
                    "as": "workout"
                }
            },
            {
                "$project": {
                    "date": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$planDate"
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
            }
        ], function (err, plans) {
            if (err) return res.status(500).send({ msg: err.message })
            res.send({ plans: plans })
        })
    })
router.route("/:id")
    .get((req, res) => {
        const { id } = req.params
        Plan.findById(id).populate('workout').then(plan => {
            res.send({ plan: plan })
        }).catch(error => {
            res.status(500).send({ msg: error.message })
        })
    })

module.exports = router
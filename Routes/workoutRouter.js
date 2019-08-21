const express = require('express')
const Workout = require('../models/workoutModel')
const workoutRouter = express.Router()

workoutRouter.route('/add')
    .post((req, res) => {
        let workoutObj = req.body
        workoutObj.setList = JSON.parse(req.body.setList)
        new Workout(workoutObj).save().then(savedWorkout => {
            res.send({ msg: "Success" })
        }).catch(err => {
            res.status(500).send({ msg: err.message })
        })
    })
workoutRouter.route('/list/:userId')
    .get((req, res) => {
        const { userId } = req.params
        Workout.find({ "userId": userId }).then(workouts => {
            res.send({ workouts: workouts })
        }).catch(error => {
            res.status(500).send(error)
        })
    })
workoutRouter.route('/:id')
    .delete((req, res) => {
        const { id } = req.params
        Workout.remove({ _id: id }).then(result => {
            res.send({ msg: "Success in remove workout" })
        }).catch(error => {
            res.status(500).send(error)
        })
    })
    .get((req, res) => {
        const { id } = req.params
        Workout.findById(id).then(workout => {
            res.send({ workout: workout })
        }).catch(error => {
            res.status(500).send(error)
        })
    })
workoutRouter.route('/share')
    .post((req, res) => {
        const { id, shareStatus } = req.body
        Workout.update({ _id: id }, { isShared: shareStatus }).then(result => {
            res.send({ msg: "Success in share workout" })
        }).catch(error => {
            res.status(500).send(error)
        })
    })
workoutRouter.route('/more')
    .post((req, res) => {
        const { myId } = req.body
        Workout.find({ userId: { $ne: myId }, isShared: true }).populate('userId').then(result => {
            let workouts = []
            result.forEach(item => {
                workouts.push({
                    title: item.name,
                    creator: item.userId.userId,
                    createDate: item.createdAt.toDateString(),
                    id: item._id,
                    setCount: item.setCount,
                    setList: item.setList
                })
            })
            res.send({ workouts: workouts })
        }).catch(error => {
            res.status(500).send(error)
        })
    })
module.exports = workoutRouter
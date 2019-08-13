const express = require('express')
const User = require('../models/userModel')

const userRouter = express.Router()
userRouter.route('/:id')
    .get((req, res) => {
        const { id } = req.params
        User.findById(id, (err, user) => {
            if (err) return res.status(500).send({ msg: err.message })
            res.send({ user: user })
        })
    })
userRouter.route('/update')
    .post((req, res) => {
        const { id, firstName, lastName, userId, age, height, weight } = req.body
        User.update({ _id: id }, {
            $set: {
                firstName: firstName,
                lastName: lastName,
                userId: userId,
                age: age,
                height: height,
                weight: weight
            }
        }).then(result => {
            res.send({ msg: 'success in update profile' })
        }).catch(error => {
            res.status(500).send({ msg: error.message })
        })
    })

module.exports = userRouter
const express = require('express')
const authRouter = express.Router()
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const async = require('async')
var sgTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/userModel')
const Token = require('../models/tokenModel')



authRouter.route('/login')
	.post((req, res) => {
		const { email, password } = req.body
		User.findOne({ email: email }, (err, user) => {
			if (!user) return res.status(401).send({ msg: 'The email address ' + req.body.email + ' is not asscociated with any account.' })

			user.comparePassword(password, (err, isMatch) => {
				if (!isMatch) return res.status(401).send({ msg: 'Invalid email or password' })

				if (!user.isVerified) return res.status(501).send({ type: 'not-verifed', msg: 'Your account has not been verified.' })

				res.send({ userId: user._id, height: user.height, weight: user.weight })
			})
		})
	})

authRouter.route('/sign-up')
	.post((req, res) => {
		const { firstName, lastName, userId, email, password } = req.body
		User.findOne({ email: email }, (err, user) => {
			if (user) return res.status(500).send({ msg: 'The email address you have entered is already associcated with another account.' })

			user = new User({
				firstName: firstName,
				lastName: lastName,
				userId: userId,
				email: email,
				password: password
			})
			user.save(err => {
				if (err) return res.status(500).send({ msg: err.message })

				const token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') })
				token.save(err => {
					if (err) return res.status(500).send({ msg: err.message })

					var mail = {
						from: 'no-reply@ruckingapp.com',
						to: user.email,
						subject: 'Account Verification Token',
						text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/api/auth/confirmation\/' + token.token + '.\n'
					}

					const sendGridOptions = {
						auth: {
							api_user: "ruckingapp",
							api_key: "P@SSW0rd1235"
						}
					}
					const mailClient = nodemailer.createTransport(sgTransport(sendGridOptions))

					mailClient.sendMail(mail, function (err, info) {
						if (err) return res.status(500).send({ msg: err.message })
						res.send('Verification email has been sent to ' + user.email + '.')
					})
				})
			})
		})
	})

authRouter.route('/confirmation/:token')
	.get((req, res) => {
		const { token } = req.params
		Token.findOne({ token: token }, (err, token) => {
			if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' })

			// If we found a token, find a matching user
			User.findOne({ _id: token._userId }, function (err, user) {
				if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
				if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

				// Verify and save the user
				user.isVerified = true;
				user.save(function (err) {
					if (err) { return res.status(500).send({ msg: err.message }); }
					res.status(200).send("The account has been verified. Please log in.");
				});
			});
		})
	})

authRouter.route('/forgot-password')
	.post((req, res, next) => {
		const { email } = req.body
		async.waterfall([
			function (done) {
				crypto.randomBytes(20, function (err, buf) {
					const token = buf.toString('hex');
					done(err, token)
				})
			},
			function (token, done) {
				User.findOne({ email: email }, function (err, user) {
					if (!user) return res.status(500).send({ msg: 'No account with that email address exists.' })

					user.resetPasswordToken = token
					user.resetPasswordExpires = Date.now() + 3600000
					user.save(function (err) {
						done(err, token, user)
					})
				})
			},
			function (token, user, done) {


				// var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } })
				// var mailOptions = {
				// 	from: 'no-reply@yourwebapplication.com',
				// 	to: user.email,
				// 	subject: 'Password Reset',
				// 	text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
				// 		'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				// 		'http://' + req.headers.host + '/reset/' + token + '\n\n' +
				// 		'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				// }

				// transporter.sendMail(mailOptions, function (err) {
				// 	if (err) { return res.status(500).send({ msg: err.message }); }
				// 	res.send('A verification email has been sent to ' + user.email + '.');
				// });
			}
		], function (err) {
			if (err) return res.status(500).send({ msg: err.message })
			res.send({ msg: 'Password reset message successfully sent. Please check your email inbox.' })
		})
	})

module.exports = authRouter
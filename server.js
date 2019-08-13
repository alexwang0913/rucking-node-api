var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
require('dotenv').config({ path: __dirname + "/.env" })

const userRouter = require('./Routes/userRouter')
const authRouter = require('./Routes/authRouter')
const workoutRouter = require('./Routes/workoutRouter')
const workoutHistoryRouter = require('./Routes/workoutHistoryRouter')
const planRouter = require('./Routes/planRouter')

const app = express();
const port = process.env.PORT
// Connecting to the database
const db = mongoose.connect(process.env.DB_ADDRESS);

// setting body parser middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/workout', workoutRouter)
app.use('/api/workout-history', workoutHistoryRouter)
app.use('/api/plan', planRouter)

// Running the server
app.listen(port, () => {
	console.log(`http://localhost:${port}`)
})


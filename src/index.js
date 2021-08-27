const express = require('express');

const userRouter = require('../src/routers/user.js')
const taskRouter = require('../src/routers/task.js')

require('../src/db/mongoose.js');

const app = express()
const port = process.env.PORT

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.get("/", (_, res) => {
    res.send("Welcome to My Server")
})

app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})

const jwt = require('jsonwebtoken');

const myFunc = async() => {

}

myFunc()
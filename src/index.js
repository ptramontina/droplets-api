const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const groupRouter = require('./routers/group')
const deviceRouter = require('./routers/device')

const mqttClient  = require('./mqtt-manager/mqtt-client')

const Device = require('./models/device')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(groupRouter)
app.use(deviceRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

Device.find({}, (err, devices) => {
    devices.forEach(device => {
        mqttClient.subscribe(device._id + '/api')
    })
})

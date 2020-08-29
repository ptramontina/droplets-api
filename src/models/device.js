const mongoose = require('mongoose')
const Property = require('./property')

const deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    code: {
        type: Number,
        required: true,
        min: 1
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Group'
    },
    path: {
        type: String
    },
    avaliableProperties: [{
        name: {
            type: String,
            required: true
        },
        read: {
            type: Boolean,
            default: true
        },
        write: {
            type: Boolean,
            default: false
        }
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

deviceSchema.index({ code: 1, owner: 1 }, { unique: true })

deviceSchema.methods.getPath = async function () {
    const device = this
    if (device.path) {
        return device.path
    }
    await device.populate('group').execPopulate()
    return await device.group.getPath() + '/' + device.code
}

deviceSchema.statics.handleMessage = async (_id, data) => {
    const device = await Device.findOne({ _id })

    if (!device) {
        throw new Error('Device not found')
    }

    console.log(data)

    for (variable in data) {
        if (device.avaliableProperties.find(ap => variable === ap.name && ap.read)) {
            console.log('update '+ variable + ' set -> ' + data[variable])

            property = await new Property({
                name: variable,
                value: data[variable],
                device: device._id
            }).save()
        } else {
            console.log('variable '+ variable +' does not exist. [' + data[variable] + '] wont be set' )
        }
    }
}

deviceSchema.post('save', async function (next) {
    try {
        const device = this
        const path = await device._id + '/api'

        mqttClient.subscribe(path)
        
        console.log('Subscribed to: ' + path)
    } catch (error) {
        console.log(error)
    }

    next()
})

const Device = mongoose.model('Device', deviceSchema)

module.exports = Device

mqttClient = require('../mqtt-manager/mqtt-client')

const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    value: {
        type: mongoose.Mixed,
        required: true
    },
    device: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Device'
    }
}, {
    timestamps: true
})

const Property = mongoose.model('Property', propertySchema)

module.exports = Property
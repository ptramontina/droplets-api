const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    parentGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

groupSchema.pre('remove', async function (next) {
    const group = this

    await Device.deleteMany({ parentGroup: group._id })

    next()
})

groupSchema.methods.getPath = async function () {
    const group = this

    if (group.parentGroup) {
        await group.populate('parentGroup').execPopulate()
        return `${await group.parentGroup.getPath()}/${group.description}`
    }
    
    return group.description
}

const Group = mongoose.model('Group', groupSchema)

module.exports = Group
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Group = require('../models/group')

router.post('/groups', auth, async (req, res) => {
    try {
        if (req.body.parentGroup) {
            const parentGroup = await Group.findOne({ _id: req.body.parentGroup, owner: req.user._id })
            if (!parentGroup) {
                throw new Error('Parent group not found')
            }
        }

        const group = new Group({
            ...req.body,
            owner: req.user._id
        })

        await group.save()
        res.status(201).send(group)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/groups', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'groups', 
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.groups)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/groups/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const group = await Group.findOne({ _id, owner: req.user._id })

        if (!group) {
            return res.status(404).send()
        }

        res.send(device)
    } catch (e) {
        res.status(500).send()       
    }
})

router.patch('/groups/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
        const group = await Group.findOne({ _id: req.params.id, owner: req.user._id })

        if (!group) {
            return res.status(404).send()
        }
        
        updates.forEach((update) => group[update] = req.body[update])
        await group.save()

        res.send(group)
    } catch (e) {
        res.status(400).send(e)       
    }
})

router.delete('/groups/:id', auth, async (req, res) => {
    try {
        const group = await Device.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!group) {
            return res.status(404).send()
        }

        res.send(group)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Device = require('../models/device')
const Group = require('../models/group')

router.post('/devices', auth, async (req, res) => {
    try {
        const group = await Group.findOne({ _id: req.body.group, owner: req.user._id })
    
        if (!group) {
            throw new Error('Group not found')
        }
    
        const device = new Device({
            ...req.body,
            owner: req.user._id
        })
        
        await device.save()
        res.status(201).send(device)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/devices', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.group) {
        match.group = req.query.group
    }

    if (req.query.code) {
        match.code = req.query.code
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'devices', 
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.devices)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/devices/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const device = await Device.findOne({ _id, owner: req.user._id })

        if (!device) {
            return res.status(404).send()
        }

        res.send(device)
    } catch (e) {
        res.status(500).send()       
    }
})

router.patch('/devices/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'code', 'group', 'path', 'avaliableProperties']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
        const device = await Device.findOne({ _id: req.params.id, owner: req.user._id })

        if (!device) {
            return res.status(404).send()
        }

        if (updates.availableProperties) {
            updates = updates.filter(u => u !== 'availableProperties')

            
        }
        
        // updates.forEach((update) => device[update] = req.body[update])
        // await device.save()

        res.send(device)
    } catch (e) {
        res.status(400).send(e)       
    }
})

router.delete('/devices/:id', auth, async (req, res) => {
    try {
        const device = await Device.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!device) {
            return res.status(404).send()
        }

        res.send(device)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
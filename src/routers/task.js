const express = require('express');

const Task = require('../models/task');
const auth = require('../middleware/auth')

const router = new express.Router()

router.post("/tasks", auth, async(req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get("/tasks", auth, async(req, res) => {
    const match = {}
    const completed = req.query.completed
    if (completed) {
        match.completed = completed === 'true'
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            }
        }).execPopulate()
        return res.send(req.user.tasks)
    } catch (error) {
        return res.send(400).send(error)
    }
})

router.get("/tasks/:id", auth, async(req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }

})

router.put("/tasks/:id", auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every((key) => allowedUpdates.includes(key))

    if (!isValid) {
        return res.status(400).send()
    }
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        return res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/tasks/:id", auth, async(req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        await task.remove()
        res.send({ message: 'deleted', task })
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

module.exports = router
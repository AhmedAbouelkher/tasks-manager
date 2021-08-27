const express = require('express');

const User = require('../models/user');
const auth = require('../middleware/auth')

const { upload, normalizeImg } = require('../middleware/file_upload');
const { ReplSet } = require('mongodb');

const router = new express.Router()

router.post("/users/signup", async(req, res) => {
    try {
        const body = req.body
        const result = await User(body).createNew()

        res.status(201).send(result)
    } catch (error) {
        res.status(400).send(error)
    }
})


router.post("/users/login", async(req, res) => {
    try {
        const body = req.body
        const user = await User.findByCredentials(body.email, body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})


router.get("/users/me", auth, (req, res) => {
    res.send(req.user)
})

router.post("/users/me/avatar", auth, upload.single('avatar'), normalizeImg, async(req, res) => {
    try {
        await req.user.save()
        res.send({ message: 'Avatar uploaded and saved' })
    } catch (error) {
        console.log(error);
        res.status(400).send(error)

    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete("/users/me/avatar", auth, async(req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send({ message: 'Avatar deleted' })
    } catch (error) {
        console.log(error);
        res.status(400).send(error)

    }
})

router.get("/users/:id/avatar", async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error("Avatar wan't found")
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        console.log(error);
        res.status(400).send(error)

    }
})


router.post("/users/logout", auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token != req.token)
        await req.user.save()
        res.send({})
    } catch (error) {
        res.status(500).sent(error)
    }
})

router.post("/users/logoutAll", auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({})
    } catch (error) {
        res.status(500).sent(error)
    }
})

router.put("/users/me", auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['email', 'password', 'name']
    const isValid = updates.every((key) => allowedUpdates.includes(key))

    if (!isValid) {
        return res.status(400).send()
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        return res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/users/me", auth, async(req, res) => {
    try {
        await req.user.remove()
        res.send()
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})


module.exports = router
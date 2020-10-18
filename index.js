const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jbp81.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const feedbackCollection = client.db("creativeAgency").collection("feedbacks");
    const serviceCollection = client.db("creativeAgency").collection("services");
    const orderCollection = client.db("creativeAgency").collection("orders");
    const adminCollection = client.db("creativeAgency").collection("admins");
    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/orders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/orders/:email', (req, res) => {
        orderCollection.find({ email: req.params.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.post('/addReview', (req, res) => {
        const review = req.body
        feedbackCollection.insertOne(review)
            .then(result => {
                if (result.insertedCount > 0) {
                    res.sendStatus(200)
                } else {
                    result.sendStatus(404)
                }
            })

    })



    // Upload the order status

    app.patch("/updateOrders/:id", (req, res) => {
        orderCollection.updateOne({ _id: ObjectId(req.params.id) },

            {
                $set: { status: req.body.status }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })
    app.post('/addOrder', (req, res) => {
        const file = req.files.file;
        const userName = req.body.userName;
        const email = req.body.email;
        const name = req.body.name;
        const details = req.body.details;
        const price = req.body.price;
        const status = req.body.status;
        const encImg = file.data.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderCollection.insertOne({ userName, email, name, email, details, price, image, status })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const userName = req.body.userName;
        const email = req.body.email;
        const name = req.body.name;
        const details = req.body.details;
        const price = req.body.price;
        const encImg = file.data.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ userName, email, name, email, details, price, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/feedbacks', (req, res) => {
        feedbackCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });
    app.post('/makeAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.insertOne({ email })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

});


app.listen(process.env.PORT || port)
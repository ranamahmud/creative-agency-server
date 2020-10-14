const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
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
    console.log("connected");

    // app.post('/addAppointment', (req, res) => {
    //     const appointment = req.body;
    //     appointmentCollection.insertOne(appointment)
    //         .then(result => {
    //             res.send(result.insertedCount > 0)
    //         })
    // });

    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // app.post('/appointmentsByDate', (req, res) => {
    //     const date = req.body;
    //     const email = req.body.email;
    //     doctorCollection.find({ email: email })
    //         .toArray((err, doctors) => {
    //             const filter = { date: date.date }
    //             if (doctors.length === 0) {
    //                 filter.email = email;
    //             }
    //             appointmentCollection.find(filter)
    //                 .toArray((err, documents) => {
    //                     console.log(email, date.date, doctors, documents)
    //                     res.send(documents);
    //                 })
    //         })
    // })

    app.post('/addOrder', (req, res) => {
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

        orderCollection.insertOne({ userName, email, name, email, details, price, image })
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

    // app.post('/isDoctor', (req, res) => {
    //     const email = req.body.email;
    //     doctorCollection.find({ email: email })
    //         .toArray((err, doctors) => {
    //             res.send(doctors.length > 0);
    //         })
    // })

});


app.listen(process.env.PORT || port)

const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()

const app = express()

app.use(cors());
app.use(bodyParser.json());

var serviceAccount = require("./configs/burj01-firebase-adminsdk-g1au9-ab00d04648.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.38p2l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("alArab").collection("booking");
  console.log('connect');

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    collection.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    console.log(newBooking);
  })

  app.get("/bookings", (req, res) => {

    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          if(tokenEmail == req.query.email){
            collection.find({email: req.query.email})
            .toArray((err,documents) => {
              res.send(documents);
            })
          }
          // ...
        })
        .catch((error) => {
          // Handle error
        });
    }
    // console.log(req.headers.authorization);
    // collection.find({email: req.query.email})
    // .toArray((err,documents) => {
    //     res.send(documents);
    // })
  })


});


app.listen(5000);
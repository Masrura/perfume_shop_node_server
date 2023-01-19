const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bjnos.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        console.log("connected to db");
        const database = client.db('perfume_shop');
        const usersCollection = database.collection('users');
        const perfumeCollection = database.collection('perfumes');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('review');
        
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(req.body);
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        app.get('/perfumes', async (req, res) => {
            const cursor = perfumeCollection.find({});
            const perfumes = await cursor.toArray();
            res.send(perfumes);
        });
        app.post('/perfume', async (req, res) => {
            const order = req.body;
            const result = await perfumeCollection.insertOne(order);
            // console.log(result);
            res.json(result);
        });
       
        app.get('/perfume/:pId', async (req, res) => {
            const id = req.params.pId;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await perfumeCollection.findOne(query);
            // console.log(result);
            res.json(result);
            // const cursor = perfumeCollection.find({});
            // const perfumes = await cursor.toArray();
            // res.send(perfumes);
        });
        app.post('/place-order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            // console.log(result);
            res.json(result);
        });
        app.post('/review', async (req, res) => {
            const order = req.body;
            const result = await reviewCollection.insertOne(order);
            // console.log(result);
            res.json(result);
        });

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { email: email };
            const cursor = await orderCollection.find(query);
            const result = await cursor.toArray();
            // console.log(result);
            res.json(result);
          
        });
        app.get('/orders', async (req, res) => {
           
            const cursor = await orderCollection.find({});
            const result = await cursor.toArray();
            // console.log(result);
            res.json(result);

        });

        app.delete("/deleteOrder/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });
        app.delete("/deleteProduct/:id", async (req, res) => {
            console.log('server hitted')
            console.log(req.params.id);
            const result = await perfumeCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });
        app.put('/updateOrder/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Shipped'
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log('put', req.decodedEmail)
            // const requester = req.decodedEmail;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello  Fragrance for you 2')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})
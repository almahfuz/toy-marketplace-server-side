const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ciazqpr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const toyDbCollections = client.db("ToyDB").collection("ToyPortals");

        app.get("/alltoy", async (req, res) => {
            const cursorToy = toyDbCollections.find();
            const result = await cursorToy.toArray();
            res.send(result);
        });


        app.get('/singleToyDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const options = {
                // Include only the `title` and `imdb` fields in the returned document
                projection: {
                    ToyName: 1,
                    Price: 1,
                    AvailableQuantity: 1,
                    SellerName: 1,
                    DetailDescription: 1,
                    ImagesURL: 1,
                    SellerEmail: 1,
                    Rating: 1
                },
            };
            const result = await toyDbCollections.findOne(query, options);
            res.send(result);
        })






        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Toy market sever running')
})


app.listen(5000, () => {
    console.log("server is running on port 5000");
});
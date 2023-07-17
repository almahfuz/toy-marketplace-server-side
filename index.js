const express = require("express");
const cors = require("cors");
// const jwt = require('jsonwebtoken');
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
// const verifyJWT = (req, res, next) => {
//     const authorization = req.headers.authorization;
//     if (!authorization) {
//         return res.status(401).send({
//             error: true,
//             message: 'unauthorized access'
//         });
//     }
//     const token = authorization.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({
//                 error: true,
//                 message: 'unauthorized access'
//             })
//         }
//         req.decoded = decoded;
//         next();
//     })
// }

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const AddedToyDB = client.db('ToyDB').collection('AddedToyDB');
        // const toyDbCollections = client.db('ToyDB').collection('ToyPortals');
        // jwt
        // app.post('/jwt', (req, res) => {
        //     const user = req.body;
        //     console.log(user);
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        //         expiresIn: '1h'
        //     });
        //     console.log(token);
        //     res.send({
        //         token
        //     });
        // })


        app.post('/AddedNewToy', async (req, res) => {
            const AddedNewToy = req.body;
            console.log(AddedNewToy);
            const result = await AddedToyDB.insertOne(AddedNewToy);
            res.send(result);
        })
        app.get("/alltoy", async (req, res) => {
            const cursorToy = AddedToyDB.find();
            const result = await cursorToy.toArray();
            res.send(result);
        });
        app.get("/allToyDetails", async (req, res) => {
            const cursorToy = AddedToyDB.find();
            const result = await cursorToy.limit(20).toArray();
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
            const result = await AddedToyDB.findOne(query, options);
            res.send(result);
        })

        app.get("/toyData/:id", async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = {
                _id: new ObjectId(id)
            }
            const result = await AddedToyDB.findOne(query)
            console.log(result);
            res.send(result);
        })


        app.patch('/ToyUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const updatedToyData = req.body;
            const filter = {
                _id: new ObjectId(id)
            }
            const updateToy = {
                $set: {
                    ...updatedToyData
                }
            }
            // const options = {
            //     upsert: true
            // };

            const result = await AddedToyDB.updateOne(filter, updateToy);
            res.send(result);
        })

        app.delete('/mytoy/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await AddedToyDB.deleteOne(query);
            res.send(result);
        })


        app.get("/getSearchText/:text", async (req, res) => {
            const text = req.params.text;
            const result = await AddedToyDB
                .find({
                    $or: [{
                        ToyName: {
                            $regex: text,
                            $options: "i"
                        }
                    }, ],
                })
                .toArray();
            res.send(result);
        });




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
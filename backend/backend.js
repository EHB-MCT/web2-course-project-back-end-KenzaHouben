import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
// import { readFile, writeFile } from "node:fs/promises"
import express from "express";
import "dotenv/config";
import cors from "cors";

const app = express();
const port = 3000;

// Middleware 
app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(express.static("public"));

// Route/eindpoint
app.get("/", async (req, res) => {
    let message = "";
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        console.log("Pinged your deployment. You successfully connected to MonogoDB!");
        message = "Hello world: SUCCES PING";

    } catch (error) {
        res.status(500).send(`Error: ${JSON.stringify(error)}`)
    }
    finally {
        // Ensures that the client will close when you finish/error
        await client.close();
        res.send(message);
    }
});

// We maken hier een route/endpoint voor de films collection
// "/data/films" -> route naam
app.get("/data/films", async (req, res) => {
    let message = "";
    try {
        console.log("Query: ");
        console.log(req.query);
        const database = client.db("courseproject");
        const films = database.collection("films");
        // if ok one film
        // else all films -> find

        // ChatGPT fixed error that was going on in the if(re.query.id) else statement,
        // where else was never carried out
        // 12/12/2025: https://chatgpt.com/share/693bd304-418c-800a-a879-f9a055773c2d
        // query is een attribute van req
        if (req.query.id) {
            console.log("Fetching ONE film...");
            const query = { id: parseInt(req.query.id) };
            // Consulted an example where findOne() was used and implemented it to my own code
            // december 2025: https://www.mongodb.com/docs/drivers/node/current/crud/query/retrieve/#findone---example--full-file
            const result = await films.findOne(query);
            // because result was null, we put an error to it and give a status with the error
            if (result == null) {
                // 4xx -> user "fault"
                res.status(404).json({ message: "Film not found" })
            }
            message = result;
        } else {
            console.log("Fetching ALL films...");
            const cursor = films.find({});
            // Consulted an example where cursor.toArray() was used and implemented it to my own code
            // december 2025: https://www.mongodb.com/docs/drivers/node/current/crud/query/cursor/#return-an-array-of-all-documents
            const allFilms = await cursor.toArray();
            message = allFilms;
        }
        // const allValues = await result.toArray();
        // message = result;
        console.log("Query:", req.query);
        console.log("Result:", message);

        // res.send(result);
    } catch (error) {
        console.log(error);
        // 500 -> server "fault"
        res.status(500).send(`Error: ${JSON.stringify(error)}`);
    }
    finally {
        // Ensures that the client will close when you finish/error
        res.send(message);
    }
});

// user can post something new, here a rating for a movie
app.post("/data/ratings", async (req, res) => {
    try {
        console.log("Query: ");
        console.log(req.body);
        const database = client.db("courseproject");
        const ratings = database.collection("ratings");

        // Fixed an issue with Claude where error was shown in Postman
        // 19/12/2025: https://claude.ai/share/768de845-143a-43e5-b4fa-c65eda2d5949
        // Consulted an example where insertOne({}) was used and implemented it to my own code
        // 19/12/2025: https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/
        const result = await ratings.insertOne({
            username: req.body.username,
            rating: req.body.rating,
            // Fixed an error thanks to Claude help
            // 23/12/2025: https://claude.ai/share/45504781-cfff-428d-8165-c30d4be00e09
            film_id: req.body.film_id
        });

        const message = {
            succes: true,
            insertedId: result.insertedId
        };

        res.status(201).json(message);

    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${JSON.stringify(error)}`)
    } finally {
        // Fixed an error thanks to Claude help
        // 23/12/2025: https://claude.ai/share/45504781-cfff-428d-8165-c30d4be00e09
        res.send(message);
    }
});


// TODO: CRUD For reviews: Create - Read - Update - Delete
app.get("/data/rankings", async (req, res) => {
    try {
        const database = client.db("courseproject");
        const ratings = database.collection("ratings");
        const films = database.collection("films");

        const pipeline = [{
            $group: {
                _id: "$film_id",
                averageRating: { $avg: "$rating" }
            }
        },
        {
            $sort: {
                averageRating: -1
            }
        },
        {
            $limit: 3
        }
        ]

        const result = await ratings.aggregate(pipeline).toArray();

        res.json(result);

    } catch (error){
        console.log(error);
        res.status(500).send(`Error: ${JSON.stringify(error)}`);
    } finally {

    }
});

// admin has the authority to delete a rating or user
app.delete("/data/ratings", async (req, res) => {

});

// Starts the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
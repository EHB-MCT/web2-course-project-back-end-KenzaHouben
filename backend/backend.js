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
        console.log("Query");
        console.log(req.query);
        const database = client.db("courseproject");
        const films = database.collection("films");

        const query = { id: parseInt(req.query.id) };
        // https://www.mongodb.com/docs/drivers/node/current/crud/query/cursor/#return-an-array-of-all-documents
        // https://www.mongodb.com/docs/drivers/node/current/crud/query/retrieve/#findone---example--full-file

        // if ok one film
        // else all films -> find
        const result = await films.findOne(query);

        // const allValues = await result.toArray();
        message = result;
        console.log("Query:", query);
        console.log("Result:", result);

        // res.send(result);
    } catch (error) {
        // res.status(500).send(`Error: ${JSON.stringify(error)}`);
        console.log(error)
    }
    finally {
        // Ensures that the client will close when you finish/error
        res.send(message);
    }
});

// TODO: CRUD For reviews: Create - Read - Update - Delete
app.get("/reviews", async (req, res) => {
    // TODO: Return all reviews

});

app.post("/data/films", async (req, res) => {
    let data = req.body;
    console.log(data)
    res.send("succces");
});

// Starts the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

import { MongoClient, ServerApiVersion } from 'mongodb';
import express from "express";

const app = express();
const port = 3000;

const url = "mongodb+srv://kenzahouben_db_user:<db_password>@webii.mnrgcpo.mongodb.net/?appName=WEBII";

const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Middleware 
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static("public"));

app.get("/data/films", async (req, res) => {
    const contents = await readFile("data/films.json", { encoding: "utf8" });
    const data = JSON.parse(contents);
    res.json(data);
});

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
        // await client.close();
        // res.send -> it stops? VRAGEN AAN MIKE
        res.send(message);
    }
});

app.get("/films", async (req, res) => {
    const database = client.db("courseproject");

    const films = database.collection("films");

    const test = [
        {
            "imgURL": "src/images/following.jpg",
            "id": 1,
            "name": "Following",
            "year": "1998",
            "genre": "Neo-noir",
            "runtime": "1h 9m",
            "summary": "A young writer who follows strangers around London becomes entangled in the criminal world after meeting a mysterious thief. Nolan’s debut — shot on a shoestring budget in black and white."
        },
        {
            "imgURL": "src/images/memento.jpg",
            "id": 2,
            "name": "Memento",
            "year": "2000",
            "genre": "Psychological, Thriller, Mystery",
            "runtime": "1h 53m",
            "summary": "A man with short-term memory loss uses tattoos and photos to hunt his wife’s killer, told in reverse order."
        }
    ];

    const options = { ordered: true };

    const result = await films.insertMany(test, options);

    res.send(JSON.stringify(result));
});

// TODO: make collections for ratings in Mongodb in database courseproject!!
// TODO: CRUD For reviews: Create - Read - Update - Delete
app.get("/reviews", async (req, res) => {
    // TODO: Return all reviews

});


// app.post("/data/films", async (req, res) => {

//     let data = req.body;

//     console.log(data)

//     res.send("succces");
// });


// Starts the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

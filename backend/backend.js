// Import required dependencies
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
// import { readFile, writeFile } from "node:fs/promises"
import express from "express";
import "dotenv/config"; // Load environment variables from .env file
import cors from "cors"; // Enable Cross-Origin Resource Sharing

// Create Express application
const app = express();
const port = 3000; // Server will run on port 3000

// ===== MIDDLEWARE =====
// Middleware functions process requests before they reach route handlers
app.use(express.static("public")); // Serve static files from 'public' folder
app.use(express.json()); // Parse incoming JSON data
app.use(cors()); // Allow requests from different origins (frontend to backend)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

// Get MongoDB connection string from environment variables
const uri = process.env.MONGO_URI;

// Create MongoDB client with configuration
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1, // Use stable API version
        strict: true, // Enforce strict mode
        deprecationErrors: true, // Show deprecation warnings
    }
});

app.use(express.static("public"));

// Route/eindpoint
app.get("/", async (req, res) => {
    let message = "";
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // Connect to MongoDB
        await client.connect();
        // Send a ping to confirm a successful connection
        // Ping database to verify connection
        await client.db("admin").command({ ping: 1 });

        console.log("Pinged your deployment. You successfully connected to MonogoDB!");
        message = "Hello world: SUCCES PING";

    } catch (error) {
        // Send error response with 500 status (server error)
        res.status(500).send(`Error: ${JSON.stringify(error)}`)
    }
    finally {
        // Ensures that the client will close when you finish/error
        // Always close connection when done
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
        console.log(req.query); // Log query parameters from URL

        // Access the database and collection
        const database = client.db("courseproject");
        const films = database.collection("films");
        // if ok one film
        // else all films -> find

        // ChatGPT fixed error that was going on in the if(re.query.id) else statement,
        // where else was never carried out
        // 12/12/2025: https://chatgpt.com/share/693bd304-418c-800a-a879-f9a055773c2d
        // query is een attribute van req
        // Check if an ID was provided in the query string
        if (req.query.id) {
            console.log("Fetching ONE film...");
            // Create query to find film by ID
            const query = { id: parseInt(req.query.id) };
            // Consulted an example where findOne() was used and implemented it to my own code
            // december 2025: https://www.mongodb.com/docs/drivers/node/current/crud/query/retrieve/#findone---example--full-file
            // Find single document matching the query
            const result = await films.findOne(query);
            // because result was null, we put an error to it and give a status with the error
            if (result == null) {
                // 4xx -> user "fault", client error
                res.status(404).json({ message: "Film not found" })
            }
            message = result;
        } else {
            // No ID provided, fetch all films
            console.log("Fetching ALL films...");
            const cursor = films.find({}); // Empty query = get all documents
            // Consulted an example where cursor.toArray() was used and implemented it to my own code
            // december 2025: https://www.mongodb.com/docs/drivers/node/current/crud/query/cursor/#return-an-array-of-all-documents
            // Convert cursor to array of all films
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
        // 500 -> server "fault", server error
        res.status(500).send(`Error: ${JSON.stringify(error)}`);
    }
    finally {
        // Ensures that the client will close when you finish/error
        // Send the response (film data or array of films)
        res.send(message);
    }
});

// user can post something new, here a rating for a movie
app.post("/data/ratings", async (req, res) => {
    try {
        console.log("Query: ");
        console.log(req.body);// Log the request body data

        // Access database and ratings collection
        const database = client.db("courseproject");
        const ratings = database.collection("ratings");

        // Fixed an issue with Claude where error was shown in Postman
        // 19/12/2025: https://claude.ai/share/768de845-143a-43e5-b4fa-c65eda2d5949
        // Consulted an example where insertOne({}) was used and implemented it to my own code
        // 19/12/2025: https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/
        // Insert new rating document into database
        const result = await ratings.insertOne({
            username: req.body.username, // User's name
            rating: req.body.rating, // Rating value (1-5)
            // Fixed an error thanks to Claude help
            // 23/12/2025: https://claude.ai/share/45504781-cfff-428d-8165-c30d4be00e09
            film_id: parseInt(req.body.film_id) // Which film was rated
        });

        // Create success response with inserted document ID
        const message = {
            succes: true,
            insertedId: result.insertedId
        };

        // 201 = Created (successful POST request)
        res.status(201).json(message);

    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${JSON.stringify(error)}`)
    }
    // finally {
    //     // Fixed an error thanks to Claude help
    //     // 23/12/2025: https://claude.ai/share/45504781-cfff-428d-8165-c30d4be00e09
    //     res.send(message);
    // }
});


// Step-by-step guide where Claude helped with guiding me and correcting mistakes
// 23/12/2025: https://claude.ai/share/d0ca1706-a9bb-4edb-8813-2560ac825a22
app.get("/data/rankings", async (req, res) => {
    try {
        // Access database and ratings collection
        const database = client.db("courseproject");
        const ratings = database.collection("ratings");

        // Aggregation pipeline - processes data in stages
        const pipeline = [
            {
                $addFields: {
                    film_id: {
                        $toInt: {
                            $convert: {
                                input: "$film_id",
                                to: "int",
                                onError: null
                            }
                        }
                    }
                }
            },
            {
                // Consulted an example where $group was used and implemented it to my own code
                // 23/12/2025: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/

                // Stage 1: Group ratings by film_id and calculate average
                $group: {
                    _id: "$film_id", // Group by film_id
                    // Consulted an example where $avg was used and implemented it to my own code
                    // 23/12/2025: https://www.mongodb.com/docs/manual/reference/operator/aggregation/avg/
                    averageRating: { $avg: "$rating" } // Calculate average rating
                }
            },
            {
                // Consulted an example where $sort was used and implemented it to my own code
                // 23/12/2025: https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/

                // Stage 2: Sort by average rating (descending = highest first)
                $sort: {
                    averageRating: -1 // -1 = descending order
                }
            },
            {
                // Stage 3: Limit to top 3 results
                $limit: 3
            },
            {
                // Stage 4: Convert _id from string to integer for lookup
                $addFields: {
                    _id: { $toInt: "$_id" }
                }
            },
            {
                // Consulted an example where $lookup was used and implemented it to my own code
                // 23/12/2025: https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/

                $lookup: {
                    from: "films", // Collection to join with
                    localField: "_id", // Field from ratings (film_id)
                    foreignField: "id", // Field from films to match
                    as: "filmDetails" // Name for joined data array
                }
            }
        ]

        // Execute aggregation pipeline and convert result to array
        const result = await ratings.aggregate(pipeline).toArray();


        // Send rankings as JSON response

        res.json(result);

    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${JSON.stringify(error)}`);
    } finally {
        // No cleanup needed here
    }
});

// Step-by-step guide where Claude helped with guiding me and correcting mistakes by making the show all rankings
// 07/03/2026: https://claude.ai/share/813b270f-2df2-4be1-bb9e-4b1bb457faf2
app.get("/data/rankings/all", async (req, res) => {
    const database = client.db("courseproject");
    const ratings = database.collection("ratings");

    try {
        const pipeline = [
            {
                $addFields: {
                    film_id: {
                        $toInt: {
                            $convert: {
                                input: "$film_id",
                                to: "int",
                                onError: null
                            }
                        }
                    }
                }
            },
            {
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
                $addFields: {
                    _id: { $toInt: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "films",
                    localField: "_id",
                    foreignField: "id",
                    as: "filmDetails"
                }
            }
        ]
        const result = await ratings.aggregate(pipeline).toArray();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${JSON.stringify(error)}`);
    } finally {
    }
});

// Step-by-step guide with Claude on how to make an average rating for each film
// 21/02/2026: https://claude.ai/share/72bdf942-f215-4693-b676-9aadc1112122
app.get("/data/ratingPerFilm", async (req, res) => {
    const database = client.db("courseproject");
    const ratings = database.collection("ratings");

    try {

        if (req.query.id) {
            const pipeline = [
                {
                    $addFields: {
                        film_id: {
                            $toInt: {
                                $convert: {
                                    input: "$film_id",
                                    to: "int",
                                    onError: null
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        film_id: parseInt(req.query.id)
                    }
                },
                {
                    $group: {
                        _id: "$film_id",

                        averageRating: { $avg: "$rating" }
                    }
                },
                {
                    $addFields: {
                        averageRating: { $round: ["$averageRating", 1] }
                    }
                },
                {
                    $lookup: {
                        from: "films",
                        localField: "_id",
                        foreignField: "id",
                        as: "filmDetails"
                    }
                }
            ]

            const result = await ratings.aggregate(pipeline).toArray();
            res.json(result);
        } else {
            res.status(400).json({ message: "No rating received" })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send(`Error: ${JSON.stringify(error)}`);
    }

});

// admin has the authority to delete a rating or user
app.delete("/data/ratings", async (req, res) => {

});

// ===== START SERVER =====
// Start listening for requests on specified port
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
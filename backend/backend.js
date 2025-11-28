import express from "express";
import { readFile, writeFile } from "node:fs/promises";
const app = express();
const port = 3000;

// const secret_password = process.env.SECRET_PASSWORD // 'test;

//21:22 -> gitignore

// TODO: backend folder wegdoen

// https://www.youtube.com/live/_OFH6RX9G4s -> timestamp = 23:09

// render: https://dashboard.render.com/web/srv-d4kmabmuk2gs73fucsc0/events
 
app.use(express.static("public"));
app.use(express.json());

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
 
app.use(express.static("public"));
 
app.get("/", (req, res) => {
    res.sendFile("public/index.html");
});
app.get("/data/films", async (req, res) => {
    const contents = await readFile("data/films.json", { encoding: "utf8" });
    const data = JSON.parse(contents);
    res.json(data);
});
 
app.post("/data/films", async (req, res) => {
    
    let data = req.body;

    console.log(data)
 
    res.send("succces");
});
 
 
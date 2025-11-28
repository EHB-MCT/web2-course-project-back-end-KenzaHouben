import express from "express";
import { readFile, writeFile } from "node:fs/promises";
const app = express();
const port = 3000;
 
app.use(express.static("public"));
app.use(express.json());
 
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
 
app.use(express.static("public"));
 
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
 
 
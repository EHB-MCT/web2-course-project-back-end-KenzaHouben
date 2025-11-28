 //const express = require("express"); can use only if you don't add "type" = "module"
import express from "express";
import { readFile, writeFile } from "node:fs/promises";
const app = express();
const port = 3000;
 
app.use(express.static("public"));
app.use(express.json()); //alle data van en naar de api is uniek
 
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
 
app.use(express.static("public"));
 
app.get("/api/films", async (req, res) => {
    const contents = await readFile("data/films.json", { encoding: "utf8" });
    const data = JSON.parse(contents);
    res.json(data);
});
 
//app.get("/api/boardgame", (req,res) => {
//    res.send("test");
//})
 
app.get("/api/boardgame", async (req, res) => {
    //To get individually each id of the boardgames
    let id = req.query.id;
    //Read the boardgame file
    const contents = await readFile("data/films.json", { encoding: "utf8" });
    const data = JSON.parse(contents);
    //get one bg
    let bg = data[id]; //vb. data.120677
    res.json(bg);
});
 
app.post("/api/boardgame", async (req, res) => {
    //Request the body so you can post a new boardgame via a body
    let data = req.body;
    //res.send(req)
    //writeFile so that it allows you to post a new body (I think)?
    //Extra van Mike: Errase all white spaces
    //data.name -> gets random naam van u boardgames
    const fileName = data.name.replaceAll(" ", ""); //replaceAll(" ", "") maakt dat al u witruimte weggaat
    await writeFile(`data/${fileName}.json`, JSON.stringify(data)); //string meegeven
    res.send("succces");
});
 
 
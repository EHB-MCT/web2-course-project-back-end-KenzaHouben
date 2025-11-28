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

// duplicated the same one on accident

// app.get("/api/films", async (req, res) => {
//     // To get individually each id of the films
//     let id = req.query.id;
//     // Reads the file
//     const contents = await readFile("data/films.json", { encoding: "utf8" });
//     const data = JSON.parse(contents);
//     //get one film
//     let films = data[id]; 
//     res.json(films);
// });
 
app.post("/api/films", async (req, res) => {
    
    let data = req.body;

    console.log(data)
 
    // const fileName = data.name.replaceAll(" ", "");
    // await writeFile(`data/${fileName}.json`, JSON.stringify(data));
    res.send("succces");
});
 
 
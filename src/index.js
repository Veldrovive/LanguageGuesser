import express from 'express'
import brain from 'brain'
//import {writeFile} from 'fs'
import {writeFile, readFile} from 'jsonfile'

var app = express();
var net = new brain.NeuralNetwork();

var PORT = 3000;

net.train([{input: [0, 0], output: [0]},
    {input: [0, 1], output: [1]},
    {input: [1, 0], output: [1]},
    {input: [1, 1], output: [0]}]);

app.get('/help/:id', (req, res) => {
    res.send('Hello World: '+req.params.id);
});

app.get('/sample/:num1/:num2', (req, res) => {
    req = req.params;
    var output = net.run([req.num1, req.num2]);

    res.send("Output: "+output);
});

app.get("/write", (req, res) => {
    var json = net.toJSON();
    writeFile('./dist/network.json', json, (err) => {
        if(err){
            return console.log(err);
        }

        console.log("Network Saved");
    })

    res.send("Wrote");
})

app.get('/read', (req, res) => {
    readFile("./dist/network.json", (err, obj) => {
        if(err){
            return console.log("Read Error");
        }

        console.log("Writing to Network");
        net.fromJSON(obj);
        res.send("Read From Network");
    })
});

app.listen(PORT);

console.log("Server starting at port: "+PORT);
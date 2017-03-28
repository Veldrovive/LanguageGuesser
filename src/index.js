import express from 'express'
import brain from 'brain'
//import {writeFile} from 'fs'
import {writeFile, readFile} from 'jsonfile'

var app = express();
var net = new brain.NeuralNetwork();

var PORT = 3000;

net.train(arrayToInOut([{input: "Hello", output: [1]}, {input: "Goody", output: [0]}]));

app.get('/help/:id', (req, res) => {
    res.send('Hello World: '+req.params.id);
});

app.get('/sample/:string', (req, res) => {
    req = req.params;
    var output = net.run(toInt(req.string));

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

//input array should be objects with input and output
function arrayToInOut(array){
    return array.map(toInt);
    function toInt(array){
        var intObject =  {input: array.input.toLowerCase().trim().split('').map(char), output: array.output};

        function char(symbol) {
            return charToDec(symbol);
        }

        while (intObject.input.length < 15){
            intObject.input.push(0);
        }

        return intObject;
    }
}

function toInt(array){
    var intArray = array.toLowerCase().trim().split('').map(char);

    function char(symbol) {
        return charToDec(symbol);
    }

    while (intArray.length < 15){
        intArray.push(0);
    }

    return intArray;
}

function charToDec(char){
    return (char.charCodeAt(0)-96)/27;
}

app.listen(PORT);

console.log("Server starting at port: "+PORT);
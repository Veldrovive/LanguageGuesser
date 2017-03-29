import express from 'express'
import brain from 'brain'
//import {writeFile} from 'fs'
import Mind from 'node-mind';

var mind = Mind({activator: "sigmoid"});

import {writeFile, readFile} from 'jsonfile'

var app = express();
var net = new brain.NeuralNetwork();

var PORT = 3000;
var INPUTSIZE = 20;

function readInput(){
    var trainingArray = [];

    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('/Users/aidandempster/IdeaProjects/LanguageGuesser/src/input.txt')
    });

    lineReader.on('line', function (line) {
        var input = '';
        var output = [];
        var posCounter = 0;
        while(!(line.charAt(posCounter) === "+")){
            posCounter++;
        }
        posCounter++;

        while(!(line.charAt(posCounter) === "-")){
            input += line.charAt(posCounter);
            posCounter++;
        }
        input = input.trim();
        posCounter++;

        while(line.charAt(posCounter) === "1" || line.charAt(posCounter) === "0"){
            output.push(parseInt(line.charAt(posCounter)));
            posCounter++;
        }

        trainingArray.push({input: input, output: output});
        console.log("Read Line: "+trainingArray.length);
    });

    lineReader.on("close", () => {
        console.log("Finished Reading: "+trainingArray.length+" lines, training with data");
        //console.log(arrayToInOut(trainingArray)[0]);
        //console.log(net.train(arrayToInOut(trainingArray)), {log: true, logPeriod: 1});
        console.log(mind.learn(arrayToInOut(trainingArray)));
    })
}

app.get('/help/:id', (req, res) => {
    res.send('Hello World: '+req.params.id);
});

app.get('/readfile', (req, res) => {
    readInput();
    res.send('File read to console');
});

mind.on('data', (iteration, errors, results) => {
    console.log("Iteration: "+iteration+", Error: "+errors+", Results:"+results);
})

app.get('/sample/:string', (req, res) => {
    req = req.params;
    //var output = net.run(toIntArray(req.string));
    var mindOutput = mind.predict(toIntArray(req.string));
    //console.log(toIntArray(req.string));
    res.send("Output: "+mindOutput);
});

app.get("/write", (req, res) => {
    var download = mind.download();
    writeFile('./dist/network.json', download, (err) => {
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
        mind.upload(obj);
        res.send("Read From Network");
    })
});

//input array should be objects with input and output
function arrayToInOut(array){
    return array.map(toInt);
    function toInt(array){
        var intObject =  {input: toIntArray(array.input), output: array.output};

        function char(symbol) {
            return charToDec(symbol);
        }

        while (intObject.input.length < 20){
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

    while (intArray.length < 20){
        intArray.push(0);
    }
    return intArray;
}

function toIntArray(string){
    string = string.toLowerCase().trim();

    var intArray = [];
    var arraySize = INPUTSIZE*27;
    while(arraySize--) intArray[arraySize] = 0;

    for(var i = 0; i < string.length; i++){
        //console.log(string.charAt(i));
        if(string.charAt(i) === ' '){
            intArray[i*27] = 1;
        }else if(string.charCodeAt(i) > 96 && string.charCodeAt(i) < 123){
            var charCode = string.charCodeAt(i)-60;
            intArray[(i*27)+charCode] = 1;
        }else{
            console.log("Unrecognized character: "+string.charAt(i)+" at position: "+i);
        }
    }
    return intArray;
}

function charToDec(char){
    if(char.charCodeAt(0) == 32){
        return 0;
    }
    return (char.charCodeAt(0)-96)/27;
}

app.listen(PORT);

console.log("Server starting at port: "+PORT);
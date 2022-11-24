var matrixGenerator = require('int-matrix-generator');

class Ant {

    constructor(tourSize) {
        this.trailSize = tourSize;
        this.trail = [tourSize];
        this.visitedcity = [tourSize];
    }

    visitCity(currentIndex, city) {
        this.trail[currentIndex] = city;
        this.visitedcity[city] = true;
    }

    visited(i) {
        return this.visitedcity[i];
    }

    trailLength(graph) {
        let length = graph[this.trail[this.trailSize - 1]][this.trail[0]];
        for (let i = 0; i < this.trailSize - 1; i++) {
            length += graph[this.trail[i]][this.trail[i + 1]];
        }
        return length;
    }

    clear() {
        for (let i = 0; i < this.trailSize; i++) {
            this.visitedcity[i] = false;
        }            
    }

}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//Parameters
var c = 1.0;
var alpha = 1;
var beta = 5;
var evaporation = 0.5;
var Q = 500;
var randomFactor = 0.01;

var maxIterations = 10000;

var numberOfCities = 400;
var numberOfAnts = 400;
var graph = matrixGenerator(numberOfCities, numberOfCities, 1, 100);
var trails = matrixGenerator(numberOfCities, numberOfCities, 0, 0);
//end Parameters


for (let i = 0; i < numberOfCities; i++) {
    for (let j = 0; j < numberOfCities; j++) {
        trails[i][j] = c;
    } 
}
var ants = [];
for (let i = 0; i < numberOfAnts; i++) {
    ants.push(new Ant(numberOfCities));
}
var probabilities = [numberOfCities];

var currentIndex = 0;

var bestTourOrder = [];
var bestTourLength;


//setup ants
for (let i = 0; i < numberOfAnts; i++) {
    ants[i].clear();
    ants[i].visitCity(0, getRandomInt(numberOfCities));
}
/**
* Calculate the next city picks probabilites
*/
function calculateProbabilities(ant) {
    let i = ant.trail[currentIndex];
    var pheromone = 0.0;
    for (let l = 0; l < numberOfCities; l++) {
        if (!ant.visited(l)) {
            if(graph[i][l] !== 0) {
                pheromone += Math.pow(trails[i][l], alpha) * Math.pow(1.0 / graph[i][l], beta);
            }
        }
    }
    for (let j = 0; j < numberOfCities; j++) {
        if (ant.visited(j)) {
            probabilities[j] = 0.0;
        } else {
            let numerator = Math.pow(trails[i][j], alpha) * Math.pow(1.0 / graph[i][j], beta);
            probabilities[j] = numerator / pheromone;
        }
    }
}
/**
* Select next city for each ant
*/
function selectNextCity(ant) {
    let r = Math.random();
    if (r < randomFactor) {
        let t = getRandomInt(numberOfCities - currentIndex);
        if(!ant.visited(t)){
            return t;
        }
    }
    calculateProbabilities(ant);
    r = Math.random();
    let total = 0;
    for (let i = 0; i < numberOfCities; i++) {
        total += probabilities[i];
        if (total >= r) {
            return i;
        }
    }
    //no CITY
    return -1;
}

/**
* At each iteration, move ants
*/
function moveAnts() {       
    for (let i = currentIndex; i < numberOfCities; i++) {
        for (let j = 0; j < numberOfAnts; j++) {
            let nextCity = selectNextCity(ants[j]);
            if(nextCity > -1) {
                ants[j].visitCity(currentIndex + 1, nextCity);
            }
            else {
                //console.log(nextCity);
            }
        }
        currentIndex++;
    }
}

/**
* Update trails that ants used
*/
function updateTrails() {
    for (let i = 0; i < numberOfCities; i++) {
        for (let j = 0; j < numberOfCities; j++) {
            trails[i][j] *= evaporation;
        }
    }
    for (let i = 0; i < numberOfAnts; i++) {
        let contribution = Q / ants[i].trailLength(graph);
        for (let j = 0; j < numberOfCities; j++) {
            trails[ants[i].trail[j]][ants[i].trail[j + 1]] += contribution;
        }
        trails[ants[i].trail[numberOfCities - 1]][ants[i].trail[0]] += contribution;
    }
}

/**
* Update the best solution
*/
function updateBest() {
    if (bestTourOrder.length === 0) {
        bestTourOrder = ants[0].trail;
        bestTourLength = ants[0].trailLength(graph);
    }
    for (let i = 0; i < numberOfAnts; i++) {
        if (ants[i].trailLength(graph) < bestTourLength) {
            bestTourLength = ants[i].trailLength(graph);
            bestTourOrder = ants[i].trail;
        }
    }
}

for (let i = 0; i < maxIterations; i++) {
    moveAnts();    
    updateTrails();
    updateBest();
}
console.log("Best tour length: " + bestTourLength);
console.log("Best tour order: " + bestTourOrder);

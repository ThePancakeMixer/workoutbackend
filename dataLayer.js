const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'WorkoutDB';
const colName = 'dummy'
const client = new MongoClient(url, {useUnifiedTopology: true});
const FirebaseAPI = require('./firebaseAuth.js')


async function initialize(){
    try
    {
    
        console.log("Mongo start")
        await client.connect()
        console.log("Mongo connected")
    }
    catch(err)
    {
        console.log("Mongo failed to connect " + err)
    }
}
function getMonday() {
    var curr = new Date; // get current date
    var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    console.log(first)
    curr = new Date(curr.setHours(0,0,0,0))
    return new Date(curr.setDate(first))
}
function getStartOfMonth() {
    var curr = new Date; // get current date
    var first = curr.getDate(); // First day is the day of the month - the day of the week
    curr = new Date(curr.setHours(0,0,0,0))
    return new Date(curr.setDate(1))
}
function getStartOfYear(){
    var curr = new Date; // get current date
    var first = curr.getDate(); // First day is the day of the month - the day of the week
    curr = new Date(curr.setHours(0,0,0,0))
    curr = new Date(curr.setMonth(0))
    return new Date(curr.setDate(1))
}
function getStartOfDay() {
    var curr = new Date; // get current date
    var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    console.log(first)
    return new Date(curr.setHours(0,0,0,0))
}



function ParseWorkoutData(workoutData){

    var startOfMonth = getStartOfMonth();
    var startOfYear = getStartOfYear();
    var startofWeek = getMonday()
    var startOfDay = getStartOfDay() 

    let exName_stats = {}
    let global_stats = {}
    
    let exNames = new Set()

    for(let i=0; i<workoutData.length; i++){

        let data = workoutData[i];
        exNames.add(data.exName)

        if(!(data.exName in exName_stats))
        {
            exName_stats[data.exName] = []
        }
        if(!(data.exName in global_stats))
        {
            global_stats[data.exName] = {}
            global_stats[data.exName].daily = {name : "Past Day" , weight:0 , reps: 0}
            global_stats[data.exName].weekly = {name: "Past Week" , weight:0 , reps: 0}
            global_stats[data.exName].monthly = {name: "Past Month", weight:0 , reps: 0}
            global_stats[data.exName].yearly = {name: "Past Year",weight:0 , reps: 0}
        }

        data.weight = parseInt(data.weight,10)
        if(data.date >startOfDay){
            exName_stats[data.exName].push({
                exName : data.exName,
                reps: data.reps,
                weight : data.weight,
                date : data.date
            })
            if(data.weight > global_stats[data.exName].daily.weight){
                let weight = data.weight
                let reps = data.reps
                global_stats[data.exName].daily = {name : "Past Day" , weight, reps}
            }
        }


        if(data.date >startofWeek){
            if(data.weight > global_stats[data.exName].weekly.weight){
                let weight = data.weight
                let reps = data.reps
                global_stats[data.exName].weekly = {name: "Past Week" ,weight, reps}
            }
        }
        if(data.date >startOfMonth){
            if(data.weight > global_stats[data.exName].monthly.weight){
                let weight = data.weight
                let reps = data.reps
                global_stats[data.exName].monthly = {name: "Past Month",weight, reps}
            }
        }
        if(data.date >startOfYear){
            if(data.weight > global_stats[data.exName].yearly.weight){
                let weight = data.weight
                let reps = data.reps
                global_stats[data.exName].yearly = {name: "Past Year",weight, reps}
            }
        }
    }
    console.log(JSON.stringify(global_stats))
    let exNamesList = Array.from(exNames)
    return [exName_stats,exNamesList,global_stats]
}

initialize();

var DataAPI = {
    getWorkoutInfo :  async function(req,res){
        console.log("getting workout info")
        try
        {
            let uid = await FirebaseAPI.checkUserInput(req,res)
            if(!uid)
                return;
            const db = client.db(dbName)
            const col = db.collection(uid)
            const sort = {date : -1}
            let result = col.find({}).sort(sort).toArray(function(err,docs){
                let [exNamestats, exNames,globalstats] = ParseWorkoutData(docs);
                res.send({exNamestats,exNames,globalstats})
            });
        }
        catch(err)
        {
            console.log("error getting workout info " + err)
        }
    },
    postWorkoutInfo : async function(req,res){
        try
        {
            let uid = await FirebaseAPI.checkUserInput(req,res)
            if(!uid)
                return;
            let exDocument = {
                    exName : req.body.exName,
                    weight : req.body.weight,
                    reps : req.body.reps,
                    date : new Date()    
            }
            const db = client.db(dbName)
            const col = db.collection(uid)
            col.insert(exDocument)    
            const sort = {date : -1}
            let result = col.find({}).sort(sort).toArray(function(err,docs){
                let [exNamestats, exNames,globalstats] = ParseWorkoutData(docs);
                res.send({exNamestats,exNames,globalstats})
            })
        }
        catch(err)
        {
            console.log("error posting workout info: " + err)
        }
    }
}

module.exports = DataAPI;
const express = require('express')
const cors = require('cors')
const FirebaseAPI = require('./firebaseAuth.js')
const DataAPI = require('./dataLayer.js')
const app = express()
app.use(cors())
const port = 5000
app.use(express.json())

// const buildPath = './tracker/build'
// app.use(express.static(buildPath));


// app.get('/', (req, res) => {
//     res.sendFile(path.join(buildPath,'index.html'));
// })


app.get('/getWorkoutInfo', (req,res) => {
    DataAPI.getWorkoutInfo(req,res)
})

app.post('/postWorkoutInfo', (req,res) => {
    DataAPI.postWorkoutInfo(req,res)
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


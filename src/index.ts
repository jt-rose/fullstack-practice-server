import express = require("express")
import mongoDB = require("mongodb")
import morgan = require("morgan")
import helmet = require("helmet")
import cors = require("cors")
import { mongoURI } from "./mongoConnection"

const { MongoClient } = mongoDB
const app = express()
app.use(helmet())
app.use(morgan("dev"))
app.use(cors())
const port = process.env.PORT || 5000

MongoClient.connect(
    mongoURI, 
    {
        useUnifiedTopology: true
    }).then(client => {
        console.log('Connected to Database')
        const db = client.db("monster-mash")
        const monsterCollection = db.collection("monsters")

        app.get("/hellonode", (_req, res) => {
            res.json({
                text: "hello Node"
            })
        })
        
        app.get("/monsterData", (_req, res) => {
            monsterCollection.find().toArray()
            .then( result => {
                res.json(result)
            })
            .catch( err => console.error(err))
        })
        
        app.get("/add", (req, res) => {
            const { name, location, hobbies } = req.query;
            const newMonster = {
                name: typeof name === 'string' ? name : "",
                location: typeof location === 'string' ? location : "",
                hobbies: typeof hobbies === 'string' ? hobbies : ""
            }
            monsterCollection.insertOne(newMonster).then( _result => {
                monsterCollection.find().toArray()
                .then( result => {
                    res.json(result)
                })
            })
            .catch( err => console.error(err))
        })

        app.get("/edit", (req, res) => {
            const { monsterID, name, location, hobbies } = req.query;
            const editID = typeof monsterID === "string" ? monsterID : ""
            const update = { name, location, hobbies }
            
            monsterCollection.replaceOne({_id: new mongoDB.ObjectID(editID)}, update)
            .then( _result => {
                console.log(_result)
                monsterCollection.find().toArray().then( result => {
                    res.json(result)
                }).catch(err => console.error(err + `! No ${name} found`))
            })
            .catch( err => console.error(err))
        })
        
        app.get("/remove/:monsterID", (req, res) => {
            const removeID = req.params.monsterID
            monsterCollection.deleteOne({ _id: new mongoDB.ObjectID(removeID) })
            .then( _result => {
                monsterCollection.find().toArray().then( result => {
                    res.json(result)
                })
            })
            .catch( err => console.error(err))
        })
        
        app.listen(port, () => {
            console.log(
                `listening on port ${port}`
            )
        })
      })
      .catch(error => console.error(error))
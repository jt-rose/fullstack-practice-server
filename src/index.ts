import express = require("express")
import mongoDB = require("mongodb")
import pg = require("pg")

import morgan = require("morgan")
import helmet = require("helmet")
import cors = require("cors")
import bodyParser = require("body-parser")
import { mongoURI, postgresURI } from "./connections"

const { MongoClient } = mongoDB
const app = express()
app.use(helmet())
app.use(morgan("dev"))
app.use(cors())
app.use(bodyParser.json())
const port = process.env.PORT || 5000

MongoClient.connect(
    mongoURI, 
    {
        useUnifiedTopology: true
    }).then(clientMongo => {
        console.log('Connected to Database')
        const db = clientMongo.db("monster-mash")
        const monsterCollection = db.collection("monsters")

        app.get("/hellonode", (_req, res) => {
            res.json({
                text: "hello Node"
            })
        })
        
        app.get("/mongo/api/monsterData", (_req, res) => {
            monsterCollection.find().toArray()
            .then( result => {
                res.json(result)
            })
            .catch( err => console.error(err))
        })
        
        app.post("/mongo/api/add", (req, res) => {
            const { name, location, hobbies } = req.body;
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

        app.put("/mongo/api/edit", (req, res) => {
            const { monsterID, name, location, hobbies } = req.body;
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
        
        app.delete("/mongo/api/remove", (req, res) => {
            const removeID = req.body.monsterID
            monsterCollection.deleteOne({ _id: new mongoDB.ObjectID(removeID) })
            .then( _result => {
                monsterCollection.find().toArray().then( result => {
                    res.json(result)
                })
            })
            .catch( err => console.error(err))
        })

      })
      .catch(error => console.error(error))

      // postgres
        
const clientPostgres = new pg.Client({
    connectionString: postgresURI
})

clientPostgres.connect()

const getMonsters = () => clientPostgres.query(`
    SELECT * FROM monster_mash;`)

app.get("/postgres/api/monsterData", (_req, res) => {
    console.log("postgres monster req recieved")
    getMonsters()
  .then(res => res.rows)
  .then( rows => {
      console.log(rows)
      res.json(rows)
  })
  .catch( err => console.error(err.message))
})

app.post("/postgres/api/add", (req, res) => {
    const { name, location, hobbies } = req.body;

    clientPostgres.query(`
    INSERT INTO monster_mash ( name, location, hobbies )
    VALUES ( $1, $2, $3);
    `, [name, location, hobbies])
    .then( () => getMonsters())
    .then( result => {
        console.log(result)
            res.json(result.rows)
        })
    .catch( err => console.error(err))
})

app.put("/postgres/api/edit", (req, res) => {
    const { monsterID, name, location, hobbies } = req.body;

    clientPostgres.query(`
    UPDATE monster_mash
    SET name = $1, location = $2, hobbies = $3
    WHERE _id = $4;`, [
        name,
        location,
        hobbies,
        monsterID
    ])
    .then( () => getMonsters())
    .then( result => res.json(result.rows))
    .catch(err => console.error(err))
})

app.delete("/postgres/api/remove", (req, res) => {
    const removeID = req.body.monsterID

    clientPostgres.query(`
    DELETE FROM monster_mash 
    WHERE _id = $1;
    `, [removeID])
    .then( () => getMonsters())
    .then( result => {console.log(result.rows) 
        res.json(result.rows)})
    .catch(err => console.error(err))
})

      app.listen(port, () => {
        console.log(
            `listening on port ${port}`
        )
    })
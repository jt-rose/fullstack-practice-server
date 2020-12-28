import express = require("express")

const app = express()

const port = process.env.PORT || 5000

interface Monster {
    name: string;
    location: string;
    hobbies: string;
}


let mockDB: Monster[] = [
    {
        name: "Dracula",
        location: "Transylvania",
        hobbies: "sucking blood"
    },
    {
        name: "Zombie",
        location: "RCPD station",
        hobbies: "eating brains"
    },
    {
        name: "Cthulu",
        location: "Murky depths",
        hobbies: "spelunking"
    }
]

app.get("/hellonode", (_req, res) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.json({
        text: "hello Node"
    })
})

app.get("/monsterData", (_req, res) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.json({
        monsterData: mockDB
    })
})

app.get("/add", (req, res) => {
    const { name, location, hobbies } = req.query;
    res.header("Access-Control-Allow-Origin", "*")
    mockDB = [...mockDB, {
        name: typeof name === 'string' ? name : "",
        location: typeof location === 'string' ? location : "",
        hobbies: typeof hobbies === 'string' ? hobbies : ""
    }]
    res.json({
        monsterData: mockDB
    })
})

app.get("/remove/:monster", (req, res) => {
    const removeMonster = req.params.monster
    res.header("Access-Control-Allow-Origin", "*")
    mockDB = mockDB.filter(monster => monster.name !== removeMonster)
    res.json({
        monsterData: mockDB
    })
})

app.listen(port, () => {
    console.log(
        `listening on port ${port}`
    )
})
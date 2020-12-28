import express = require("express")

const app = express()

const port = process.env.PORT || 5000
/*
interface Monster {
    name: string;
    location: string;
    hobbies: string;
}


const mockDB: Monster[] = [
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
*/

app.get("/hellonode", (_req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    res.json({
        text: "hello Node"
    })
})

app.listen(port, () => {
    console.log(
        `listening on port ${port}`
    )
})
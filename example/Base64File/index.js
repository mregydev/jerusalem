

const uploader = require('../../dist/output.cjs')

const express = require('express')

const axios = require('axios')

const { readFileSync } = require('fs')

const app = express()

const bodyParser = require('body-parser')

//Intialize core config
//We will store to local file system
const config = {
    adapteroptions: {
        adapter: 'filesystem',
        config: {
            root: [__dirname, 'storage3']
        }
    },
    uploadAll: true
}

app.use(bodyParser.json({ limit: "50mb" }))

//Use it as middleware with express instance
app.use(uploader(config))

//Intialize endpoint
app.post('/testUpload', (req, res) => {

    console.log(req.uploader.Files[0].stream.filename)
    res.send(`file is uploaded and their count is ${req.uploader.Files[0].filename}`)
})


app.listen(8070, "localhost", () => {

    let fileStr = readFileSync('FileToRead.txt').toString('base64')

    console.log(fileStr)
    axios.post('http://localhost:8070/testUpload', {
        "base64files": [
            {
                fileStr,
                "fileExt": "txt"
            }
        ]
    }, (res) => console.log(res))
})

console.log("server is listening")



const uploader = require('../../dist/output.cjs')

const express = require('express')

const app = express();

//Intialize core config
//We will store to local file system
const config = {
    adapteroptions: {
        adapter: 'filesystem',
        config: {
            root: [__dirname, 'storage3']
        }
    },
    uploadAll: false
}

//Use core as middle ware
app.use(uploader(config))

//intialize middleware
app.post('/testUpload', (req, res) => {
    for (var file of req.uploader.Files) {
        file.upload().then(res.send(file.stream.filename))
    }
})

app.get('/', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' })
    res.end(`'<form action="/testUpload" enctype="multipart/form-data" method="post">
    <input type="file" name="upload" multiple="multiple"><br>
    <input type="submit" value="Upload">
    </form>`)
})


app.listen(8070)

console.log("server is listening")

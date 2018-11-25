
import path from 'path'

import uploader from '../../dist/output.mjs'

import express from 'express'

import bodyParser from 'body-parser'


const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();


const config = {
    adapteroptions: {
        adapter: 'filesystem',
        config: {
            root: [__dirname, 'storage3']
        }
    },
    uploadAll: false
}

//app.use(require('body-parser').urlencoded())
app.use(bodyParser.json({limit: '50mb'}))

app.use(uploader(config))


app.post('/testUpload', (req, res) => {

    for (var file of req.uploader.Files) {
        file.upload().then(console.log(file.stream.filename))
    }
    res.send(`file is uploaded and their count is ${req.uploader.Files.length}`)
})

app.get('/',(req,res)=>{
    res.writeHead(200,{'content-type':'text/html'})
    res.end(`'<form action="/testUpload" enctype="multipart/form-data" method="post">
    <input type="file" name="upload" multiple="multiple"><br>
    <input type="submit" value="Upload">
    </form>`)
})


app.listen(8070)

console.log("server is listening")
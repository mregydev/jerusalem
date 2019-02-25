
const uploader = require('../../dist/output.cjs')

const express = require('express')

const axios = require('axios')

const { readFileSync } = require('fs')

const { Buffer } = require('buffer')

const app = express()

const bodyParser = require('body-parser')

const config = {
  adapteroptions: {
    adapter: 'filesystem',
    config: {
      root: [__dirname, 'storage3']
    }
  },
  uploadAll: false
}

app.use(bodyParser.json({ limit: '50mb' }))

app.use(uploader(config))

app.post('/testUpload', (req, res) => {
  for (var file of req.uploader.Files) {
    file.upload().then(console.log(file.stream.filename))
  }

  res.send(`file is uploaded and their count is ${req.uploader.Files.length}`)
})

app.listen(8070, 'localhost', () => {
  let fileStr = readFileSync('FileToRead.txt').toString('base64')

  console.log(fileStr)
  axios.post('http://localhost:8070/testUpload', {
    'base64files': [
      {
        fileStr,
        'fileExt': 'txt'
      }
    ]
  }, (res) => console.log(res))
})

console.log('server is listening')

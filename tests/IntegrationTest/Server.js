
const uploader = require('../../dist/output.cjs')

const express = require('express')

const { readFileSync } = require('fs')

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
    file.upload().then((data) => res.send(data.location))
  }
})

app.listen(8070, 'localhost')

module.exports = app

Jerusalem is express js middle-ware for uploading files to different provider including aws s3 , google cloud and local file system.

# How to use it 
It only support cjs format and to use it you have to include it first passing it config object and make your express instance use it 

```node.js
const uploader = require('jerusalem')

//app is your express instance
app.use(uploader(config)
```

config object contains two main properties which are {adapteroptions} and {uploadAll}

{adapteroptions} is the proerties of the repo you want to save file to so in case you want to store it on aws it wil be like this

```node.js
 adapteroptions:{
 adapter: 's3',
  config: {
    // Required - cannot do anything without a bucket!
    bucket: 'my-s3-bucket',
    // The rest of the options is passed as-is to the AWS.S3() constructor
    // NOTE: You will probably need the AWS credentials here 😀
    accessKeyId: 'my-access-key-id',
    secretAccessKey: 'my-secret!'
  }
  }
```

in case file system it will be like this 
```node.js
 adapteroptions: {
    adapter: 'filesystem',
    config: {
      root: [__dirname, 'storage3'] //directory to store file
    }
  },
```

in case google cloud so it will be like this 
```node.js
{
  adapter: 'gcs',
  config: {
    bucket: 'my-gcs-bucket',
    projectId: 'project-id-123',
    keyFilename: '/path/to/keyfile.json'
  }
}
```

{uploadAll} is flag indicating whether the middle ware should upload all files before next is called

You can access files in your request handler using {req.uploader.Files}

so if you want to upload a file you call upload function which returns a promise so  you write like this

```node.js
app.post('/testUpload', (req, res) => {
  for (var file of req.uploader.Files) {
    //upload return promise
    file.upload().then(console.log(file.stream.filename))
  }
  res.send(`file is uploaded and their count is ${req.uploader.Files.length}`)
})
```


# How to attach files to request from client side

files can be attached as base64 or multipart 

please see examples folder to learn both cases

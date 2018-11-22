const uploader=require('../../dist/output.cjs')

const express=require('express')


const app = express();

const fUploader = new uploader(
    {
        adapteroptions: {
            adapter: 'filesystem',
            config: {
                root: [__dirname, '.storage']
            }
        },
        uploadAll:true
    }
);


app.use(fUploader.handle.bind(fUploader));

app.post('/testUpload',(req,res)=>
{
res.send("file is uploaded")
})


app.listen(8070)

console.log("server is listening")
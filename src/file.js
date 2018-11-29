import nodestream from 'nodestream'
import memoryStream from 'memorystream'
import uuid from 'uuid/v1'
import fs from 'fs'
import streamBuffer from 'stream-buffers'

class File {
    constructor(config) {

        if (config.adapteroptions) {
            this.uploader = new nodestream(config.adapteroptions)

            this.config = config

            //set upload option to emty object in case not set
            this.config.uploadOptions = this.config.uploadOptions || {}

        }
    }


    fetchFIleFromPart(part) {
        return new Promise((resolve, reject) => {
            if (part) {
                //Copy part to pass through stream
                this.stream = new memoryStream()

                this.stream.filename = this.config.uniquenames ? `${uuid()}.${part.filename.match(/\w+/)}` : part.filename

                part.pipe(this.stream)

                part.on('end', () => { resolve(true) })

                part.on('error', () => reject(false))
            }
        })
    }


    fetchFileFromStr(str, ext) {

        this.stream = new streamBuffer.ReadableStreamBuffer({
            chunkSize: 2048
        })

        this.stream.put(str, 'base64')


        this.stream.filename = `${uuid()}.${ext}`
    }

    get Stream() {
        return this.stream
    }

    set Stream(value) {
        this.stream = value
    }

    changeAdapter(config) {
        if (config.adapteroptions) {
            this.uploader = new nodestream(config.adapteroptions)
            this.config = config
        }
    }

    upload() {
        this.config.uploadOptions.name = this.config.uploadOptions.filename || this.stream.filename
        return this.uploader.upload(this.stream, this.config.uploadOptions);
    }
}

export default File
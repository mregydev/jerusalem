import multiparty from 'multiparty';

import File from './file';

import { EventEmitter } from 'events'

class Jerusalem extends EventEmitter {
    constructor(config) {
        super()
        this.files = []
        this.config = config
    }

    get Files() {
        return this.files
    }

    AddFile(stream) {
        this.files.push(new file(stream, this.config))
    }

    reset() {
        this.files = []
    }


    uploadAllFiles(resolve, reject) {
        let numberUploaded = 0
        for (let file of this.files) {
            file.upload().then(() => {
                if (++numberUploaded == this.files.length) {
                    resolve(true)
                }
            }).catch(msg => reject(msg))
        }
    }


    checkToUploadAllFiles() {
        return new Promise((resolve, reject) => {
            if (this.config.uploadAll) {
                return this.uploadAllFiles()
            }
            else {
                resolve(true)
            }
        })
    }

    handleBase64(req) {

        return new Promise((resolve, reject) => {

            if (req.body && req.body["base64files"]) {

                console.log
                let base64param = req.body['base64param']
                for (let param of base64param) {

                    if (param && param.fileStr && param.fileExt) {
                        let file = new File(this.config)
                        file.fetchFileFromStr(param.fileStr, param.fileExt);
                        this.files.push(file)
                        console.log("here")
                    }
                }
                this.checkToUploadAllFiles().then(() => resolve(true)).catch((msg) => {
                    reject(`Problem in uploading files`)
                })
            }
            else {
                reject(`base64files paramters not found in json body`)
            }
        })

    }

    handleMultiPart(req) {

        return new Promise((resolve, reject) => {
            let form = new multiparty.Form()

            form.on('close', () => {
                this.checkToUploadAllFiles().then(() => resolve(true)).catch((msg) => {
                    reject(`Problem in uploading files`)
                })
            })

            form.on('part', (part) => {

                if (part.filename) {
                    let file = new File(this.config)

                    file.fetchFIleFromPart(part).then(res => {
                        this.files.push(file)
                        part.resume()
                    }).catch(ex => () => reject(`Problem in uploading file ${part.filename}`))
                }
            })

            form.on('error', (err) => reject(`Error parsing form ${err.stack}`))

            form.parse(req)

        })

    }
}

export default Jerusalem;
import multiparty from 'multiparty'

import File from './fileHelper'

import Messages from './Messages'

import { EventEmitter } from 'events'

class Core extends EventEmitter {
  constructor (config) {
    super()
    this.files = []
    this.config = config
  }

  get Files () {
    return this.files
  }

  AddFile (stream) {
    this.files.push(new File(stream, this.config))
  }

  reset () {
    this.files = []
  }

  uploadAllFiles (resolve, reject) {
    let numberUploaded = 0
    for (let file of this.files) {
      file.upload().then(() => {
        if (++numberUploaded === this.files.length) {
          resolve(true)
        }
      }).catch(msg => reject(msg))
    }
  }

  checkToUploadAllFiles () {
    return new Promise((resolve, reject) => {
      if (this.config.uploadAll) {
        return this.uploadAllFiles()
      } else {
        resolve(true)
      }
    })
  }

  /**
     * @param  {} req
     * Handling request containing files as base64 string
     */
  handleBase64 (req) {
    return new Promise((resolve, reject) => {
      if (req.body && req.body['base64files']) {
        let base64param = req.body['base64files']
        for (let param of base64param) {
          if (param && param.fileStr && param.fileExt) {
            let file = new File(this.config)
            file.fetchFileFromStr(param.fileStr, param.fileExt)
            this.files.push(file)
          }
        }
        this.checkToUploadAllFiles().then(() => resolve(true)).catch((msg) => {
          reject(Messages.FilesUploadProblem)
        })
      } else {
        reject(Messages.Base64NotFound)
      }
    })
  }
  /**
     * @param  {} req
     * Handling request containing multipart form data
     */
  handleMultiPart (req) {
    return new Promise((resolve, reject) => {
      let form = new multiparty.Form()

      form.on('close', () => {
        this.checkToUploadAllFiles().then(() => resolve(true)).catch((msg) => {
          reject(Messages.FilesUploadProblem)
        })
      })

      form.on('part', (part) => {
        if (part.filename) {
          let file = new File(this.config)

          file.fetchFIleFromPart(part).then(res => {
            this.files.push(file)
            part.resume()
          }).catch(() => reject(Messages.FileUploadProblem(file.partname)))
        }
      })

      form.on('error', (err) => reject(Messages.ParsingError(err.stack)))

      form.parse(req)
    })
  }
}

export default Core

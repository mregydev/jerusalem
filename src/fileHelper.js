import Nodestream from 'nodestream'
import MemoryStream from 'memorystream'
import uuid from 'uuid/v1'
import streamBuffer from 'stream-buffers'

class File {
  constructor (config) {
    if (config && config.adapteroptions) {
      this.uploader = new Nodestream(config.adapteroptions)

      this.config = config

      // set upload option to emty object in case not set
      this.config.uploadOptions = this.config.uploadOptions || {}
    }
  }

  /**
     * @param  {} part
     */
  fetchFIleFromPart (part) {
    return new Promise((resolve, reject) => {
      if (part) {
        // Copy part to pass through stream
        this.stream = new MemoryStream()

        this.stream.filename = this.config.uniquenames ? `${uuid()}.${part.filename.match(/\w+/)}` : part.filename

        part.pipe(this.stream)

        part.on('end', () => { resolve(true) })

        part.on('error', () => reject(false))
      }
    })
  }

  /**
     * @param  {} str
     * @param  {} ext
     */
  fetchFileFromStr (str, ext) {
    this.stream = new streamBuffer.ReadableStreamBuffer({
    })

    this.stream.put(str, 'base64')

    this.stream.filename = `${uuid()}.${ext}`
  }
  /**
     * @return file stream instance
     */
  get Stream () {
    return this.stream
  }
  /**
     * @param  {} value
     * set file stream instance
     */
  set Stream (value) {
    this.stream = value
  }
  /**
     * @param  {} config
     * change uploader adapter
     */
  changeAdapter (config) {
    if (config.adapteroptions) {
      this.uploader = new Nodestream(config.adapteroptions)
      this.config = config
    }
  }
  /**
     */
  upload () {
    this.config.uploadOptions.name = this.config.uploadOptions.filename || this.stream.filename
    return this.uploader.upload(this.stream, this.config.uploadOptions)
  }
}

export default File

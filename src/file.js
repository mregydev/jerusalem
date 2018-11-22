import nodestream from 'nodestream'

class File {
    constructor(stream, config) {

        if (this.config.adapteroptions) {
            this.uploader = new nodestream(this.config.adapteroptions)
            this.config = config
            this.stream = stream
        }
    }

    get Stream() {
        return this.stream
    }

    set Stream(value) {
        this.stream = value
    }

    changeAdapter(config) {
        if (this.config.adapteroptions) {
            this.uploader = new nodestream(this.config.adapteroptions)
            this.config = config
            this.stream = stream
        }
    }

    upload() {
        this.config.uploadOptions.filename = this.config.uploadOptions.filename || this.stream.filename
        return this.uploader.upload(this.stream, this.config.uploadOptions);
    }
}

export default File;
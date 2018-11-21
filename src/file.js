import nodestream from 'nodestream'

class File {
    constructor(config) {
        this.stream = new nodestream(config)
    }

    getStream()
    {
        return this.stream;
    }

    upload(options)
    {
        return this.stream.upload(options);
    }

}

export default File;
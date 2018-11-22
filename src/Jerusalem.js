import multiparty from 'multiparty';

import file from './file';

class Jerusalem {
    constructor(config) {
        this.files = []
        this.config=config
    }

    get Files() {
        return this.files
    }

    AddFile(stream) {
        this.files.push(new file(stream,this.config))
    }


    handle(form) {
        form.on('part', (part) => {

            if (part.filename) {
                this.files.push(new file(part, this.config))

                if (this.config.uploadAll) {
                    this.files[this.files.length - 1].upload()
                }
            }

            part.resume()
        })
    }
}

export default Jerusalem;
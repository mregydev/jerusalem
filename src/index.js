
import Jerusalem from './Jerusalem'

import multiparty from 'multiparty'

class Main {
    constructor(config) {

        config.uploadOptions = config.uploadOptions || {}
        config.adapteroptions = config.adapteroptions || {}
        this.core = new Jerusalem(config)
        this.form = new multiparty.Form();
    }


    handle(req, res, next) {
        this.core.handle(this.form)
        this.form.parse(req)

        this.form.on('close', () => {
            req.uploader = this.core
            next()
        })
    }
}

export default Main
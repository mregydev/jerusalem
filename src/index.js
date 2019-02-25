
import Jerusalem from './Core'

import contentTypes from './contentTypes'




export default (config) => {

    return function (req, res, next) {

        if (!config.adapteroptions) {

            SetError(req, `config should contains adapter options`, next)
        }
        else {

            req.uploader  = new Jerusalem(config)

            let contentType = req.header('content-type')

            if (!contentType) {
                SetError(req,'No Content Type',next)
            }
            else {
                
                if (contentType.indexOf(contentTypes.JSON) > -1) {
                    req.uploader.handleBase64(req).then(() => {
                        next()
                    }).catch((msg) => {
                        SetError(req, msg, next)
                    })
                }
                else if (contentType.indexOf(contentTypes.FORM) > -1) {
                    req.uploader.handleMultiPart(req).then(() => {
                        next()
                    }).catch((msg) => {
                        SetError(req, msg, next)
                    })
                }
            }
        }
    }
}

/**
 * Set error on request object
 * @param  {} req
 * @param  {} msg
 * @param  {} next
 */
function SetError(req, msg, next) {

    req.uploader.hasError = true
    req.uploader.errorMsg = msg
    next()

}

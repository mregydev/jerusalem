
import chai from 'chai'

import Jerusalem from '../../../src/Jerusalem'

import sinon from 'sinon'

import file from '../../../src/file'

import sinonChai from 'sinon-chai'

const should = chai.should()


chai.use(sinonChai);

describe('simple test case', () => {

    let req = {
        "body": {
            "base64files": [
                {
                    fileStr: "dGVzdA==",
                    fileExt: "png"
                }
            ]
        }
    }

    let config = {
        adapteroptions: {
            adapter: 'filesystem',
            config: {
                root: [__dirname, 'storage3']
            }
        },
        uploadAll: false
    }

    let jerusalem = new Jerusalem(config)


    it('should return true', (done) => {

        const fetchFile = sinon.stub(file.prototype, "fetchFileFromStr")

        jerusalem.handleBase64(req).then(function () {


            fetchFile.should.have.been.calledOnce

            done()
        })

    })
})
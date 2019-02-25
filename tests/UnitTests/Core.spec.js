
import chai from 'chai'

import Core from '../../src/Core'

import sinon from 'sinon'

import file from '../../src/fileHelper'

import sinonChai from 'sinon-chai'

import Messages from '../../src/Messages';

import testVars from '../testVars'

import multiparty from 'multiparty'

chai.should()

chai.use(sinonChai);

let config = {
    adapteroptions: {
        adapter: 'filesystem',
        config: {
            root: [__dirname, 'storage3']
        }
    },
    uploadAll: false
}

let jerusalem = new Core(config)



describe('handlebase64 function test cases', () => {

    it("shoud reject in case request not containing base64files parameter", (done) => {
        jerusalem.handleBase64({}).catch((res) => {
            res.should.equals(Messages.Base64NotFound)
            done()
        })
    })

    it('should call file fetchFileFromStr in normal case', (done) => {

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

        const fetchFile = sinon.stub(file.prototype, "fetchFileFromStr")

        jerusalem.handleBase64(req).then(function () {

            fetchFile.should.have.been.calledOnce

            done()
        })
    })


    it('should upload files in normal case', (done) => {

        let req = testVars.testRequest

        const fetchFile = sinon.stub(jerusalem, "checkToUploadAllFiles").returns(new Promise((resolve) => resolve(true)))

        jerusalem.handleBase64(req).then(() => {

            fetchFile.should.have.been.calledOnce

            done()
        })

        sinon.restore()
    })


    it('should reject with problem in uploading file messages in case upload error', (done) => {

        let req = testVars.testRequest

        sinon.stub(jerusalem, "checkToUploadAllFiles").returns(new Promise((resolve, reject) => reject(false)))

        jerusalem.handleBase64(req).catch((msg) => {
            msg.should.equals(Messages.FilesUploadProblem)
            done()
        })

        sinon.restore()
    })
})


describe("handleMultiPart function test cases", () => {

    let parseform;

    beforeEach(() => {
        parseform= sinon.stub(multiparty.Form.prototype,"parse")
    })

    afterEach(()=>{
        sinon.restore()
    })

    it("shoud parse files in the request in normal case",(done)=>{
        
        jerusalem.handleMultiPart({})

        parseform.withArgs({}).should.be.calledOnce

        done()
    })
})
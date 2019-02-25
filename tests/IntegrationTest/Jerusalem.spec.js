require('./Server')
const axios = require('axios')
const { readFileSync } = require('fs')
const chai = require('chai')

const should = chai.should()

describe('Jerusalem test cases', () => {

    it('should copy file encoded as base64 string to server', (done) => {
        let fileStr=readFileSync(`${__dirname}/FileToRead.txt`).toString('base64')
        axios.post('http://localhost:8070/testUpload', {
            "base64files": [
                {
                    fileStr,
                    "fileExt": "txt"
                }
            ]
        }).then(res=>{
            
            setTimeout(() => {
                
                readFileSync(`${__dirname}/storage3/${res.data}`).toString().replace(/\u0000/g,'').trim().should.equals(readFileSync(`${__dirname}/FileToExpect.txt`).toString().trim())

                done()
                
            }, 10);
        
            
        })

    })

})
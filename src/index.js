import fs from 'fs';

export default function testFunc() {
    fs.createReadStream('test.txt').on('data', (data) => console.log(data))
    console.log("this is a simple test");
}


export 









      function testFun2() {
    console.log("this is the second test function");
}
import fs from 'fs';

function testFunc() {
    fs.createReadStream('test.txt').on('data', (data) => console.log(data));
    console.log("this is a simple test");
}


function testFun2() {
    console.log("this is the second test function");
}

export default testFunc;
export { testFun2 };

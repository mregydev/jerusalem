'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));

function testFunc() {
    fs.createReadStream('test.txt').on('data', (data) => console.log(data));
    console.log("this is a simple test");
}


function testFun2() {
    console.log("this is the second test function");
}

exports.default = testFunc;
exports.testFun2 = testFun2;

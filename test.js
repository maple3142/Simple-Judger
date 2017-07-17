var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var sj = require('./index.js');
fs.readFileAsync('./test.cpp').then(function (d) {
	var options = {
		src: d, //code
		in: '2 5\n', //input string
		out: '7', //output string
		timelimit: 1000, //ms
		compile: 'g++ -o {dest} {source}'
	};
	return sj(options);
}).then(result => {
	console.log(result);
}).catch(error => {
	console.error(error);
});

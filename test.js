var Promise=require('bluebird');
var fs=Promise.promisifyAll(require('fs'));
var sj=require('simple-judger');
fs.readFileAsync('./test.cpp').then(function(d){
	var options={
		src: d, //code
		in: '2 5\n', //input string
		out: '7', //output string
		timelimit: 1000, //ms
		compile: 'g++ -o {dest} {source}'
	};
	sj(options).then(result=>{
		console.log(result);
	});
});

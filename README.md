Simple Judger
================
A simple module to judge C/C++ program.(Linux only)
----------------
using [EasySandbox](https://github.com/daveho/EasySandbox)

Install:
----------------
`npm install simple-judger`

Usage:
----------------
```javascript
var sj=require('simple-judger');
var options={
	src: '#include<iostream>\nusing.......', //code !REQUIRED!
	in: '', //input string
	out: '', //output string
	timelimit: 1000, //ms !REQUIRED!
	compile: 'g++ -o {out} {dest}', //compile command, {source} {out} will be replaced !REQUIRED!
	result: { //result strings, these are default value
		Accepted: 'AC',
		Runtime_Error: 'RE',
		Time_Limit_Exceeded: 'TLE',
		Compile_Error: 'CE',
		Wrong_Answer: 'WA',
		System_Error: 'SE'
	}
};
sj(options).then(result=>{
	console.log(result);
});
```
Result Object:
----------------
```javascript
{
	result: 'AC',
	time: 10,
	extra: 'Hello World'
}
```

run `npm test` for simple test

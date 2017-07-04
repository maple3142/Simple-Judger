var Promise = require('bluebird');
var cp = require('child_process');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
judge.write = write;
judge.compile = compile;
judge.exec = exec;
judge.fx = fx;
module.exports = judge;
function Result(result, time, extra) {
	if (!extra) extra = '';
	this.result = result;
	this.time = time;
	this.extra = extra;
}
function judge(options) {
	return new Promise(function (resolve, reject) {
		try {
			if (!options) {
				reject('options required!');
				return;
			}
			var required = ['src', 'timelimit', 'compile'];
			for (var k in required) {
				if (!options[required[k]]) {
					reject('options.' + required[k] + ' required!');
					return;
				}
			}
			/*default values*/
			var rs = {
				Accepted: 'AC',
				Runtime_Error: 'RE',
				Time_Limit_Exceeded: 'TLE',
				Compile_Error: 'CE',
				Wrong_Answer: 'WA',
				System_Error: 'SE'
			};
			if (!options.result)
				options.result = {};
			for (var k in rs) {
				if (!options.result[k])
					options.result[k] = rs[k];
			}
			if (!options.in)
				options.in = '';
			if (!options.out)
				options.out = '';

			var code = options.src;
			var name = Math.random().toString(36).substring(7);
			var source = path.join(__dirname, 'temp', name + '.cpp');
			var dest = path.join(__dirname, 'temp', name + '.out');
			var compilecmd = options.compile.replace(/{([^\s]*)}/g, function (m, g) {
				if (g === 'source') return source;
				if (g === 'dest') return dest;
			});
			var timelimit = options.timelimit;
			var execcmd = 'bash -c "source ./excute.sh ./' + path.join('temp', name + '.out') + '"';
			write(source, code).then(function () {
				return compile(compilecmd);
			}).catch(function (e) {
				fs.unlinkAsync(source);
				resolve(e);
			}).then(function () {
				return exec(execcmd, options.in, options.out, options.timelimit, options.result);
			}).then(function (d) {
				fs.unlinkAsync(source);
				fs.unlinkAsync(dest);
				resolve(d);
			}).catch(function (e) {
				fs.unlinkAsync(source);
				fs.unlinkAsync(dest);
				resolve(e);
			});
		}
		catch (e) {/*System_Error*/
			resolve(new Result(options.result.System_Error, -1, e));
		}
	});
};

function fx(s) {
	s = s.replace(/(\r\n|\r)/g, '\n');//crlf convert
	if (s.endsWith('\n')) s = s.slice(0, -1);//remove empty line
	return s;
}
function write(source, code) {
	return fs.writeFileAsync(source, code);
}
function compile(cmd) {
	return new Promise(function (resolve, reject) {
		var c_process = cp.exec(cmd);
		var c_out = '';
		c_process.on('data', function (s) {
			c_out += s.toString();
		});
		c_process.on('exit', function (code, sig) {
			if (code != 0) {/*Compile_Error*/
				reject(new Result(options.result.Compile_Error, -1, c_out));
			}
			else {
				resolve();
			}
		});
	});
}
function exec(cmd, input, output, limit, result) {
	return new Promise(function (resolve, reject) {
		var px = cp.exec(cmd);
		var starttime;
		px.stdin.write(input);
		var out = '';
		px.stdout.on('data', function (s) {
			if (s.toString() === '<<entering SECCOMP mode>>\n') {
				starttime = Date.now();/*real start time*/
				return;
			}
			else out += s.toString();
		});
		px.on('close', function (code) {
			var time = starttime - Date.now();
			if (code != 0) {/*Runtime_Error*/
				reject(new Result(result.Runtime_Error, time, out));
			}
			else if (fx(out) === fx(output)) {/*Accepted*/
				resolve(new Result(result.Accepted, time, out));
			}
			else {/*Wrong_Answer*/
				reject(new Result(result.Wrong_Answer, time, out));
			}
			px = null;
		});
		setTimeout(function () {/*Time_Limit_Exceeded*/
			if (!px) return;
			px.kill();
			reject(new Result(result.Time_Limit_Exceeded, Date.now() - starttime, out));
		}, limit);
	});
}
/**
 * a module to judge C/C++ code in sandbox
 * @module simple-judger
 */
var Promise = require('bluebird')
var cp = require('child_process')
var chmod = require('chmod')
var fs = Promise.promisifyAll(require('fs'))
var path = require('path')
var temppath = path.join(__dirname, 'temp')
judge.write = write
judge.compile = compile
judge.exec = exec
judge.fx = fx
function Result(result, time, extra) {
	if (!extra) extra = ''
	this.result = result
	this.time = time
	this.extra = extra
}
/**
 * judge function
 * @alias module:simple-judger
 * @param {object} options option object
 * @param {string} options.src C/C++ code
 * @param {string} options.compile compile command like "g++ -o {out} {dest}"
 * @param {number} options.timelimit timelimie
 * @param {string=} options.in input string(remember add \n at end of input)
 * @param {string=} options.out output string
 * @param {Result=} options.result custom result strings {@link Result} object
 * @property {Result} Result default result object
 */
function judge(options) {
	return new Promise(function (resolve, reject) {
		try {
			if (!options) {
				reject('options required!')
				return
			}
			var required = ['src', 'timelimit', 'compile']
			for (var k in required) {
				if (!(required[k] in options)) {
					reject('options.' + required[k] + ' required!')
					return
				}
			}
			if (options.debug) console.log(__dirname)
			if (!options.result)
				options.result = {}
			for (var k in this.Result) {
				if (!options.result[k])
					options.result[k] = rs[k]
			}
			if (!options.in)
				options.in = ''
			if (!options.out)
				options.out = ''

			var code = options.src
			var name = Math.random().toString(36).substring(7)
			var source = path.join(temppath, name + '.cpp')
			var dest = path.join(temppath, name + '.out')
			var compilecmd = options.compile.replace(/{([^\s]*)}/g, function (m, g) {
				if (g === 'source') return source
				if (g === 'dest') return dest
			})
			var timelimit = options.timelimit
			var execcmd = 'bash -c "source ./execute.sh ' + path.join(temppath, name + '.out') + '"'
			if (options.debug) console.log(compilecmd)
			if (options.debug) console.log(execcmd)
			write(source, code).then(function () {
				return compile(compilecmd, options.result.Compile_Error)
			}).catch(function (e) {
				if (!options.debug) {
					fs.unlinkAsync(source).catch(e => { })
				}
				resolve(e)
			}).then(function () {
				chmod(dest, 775)
				return exec(execcmd, options.in, options.out, options.timelimit, options.result)
			}).then(function (d) {
				if (!options.debug) {
					fs.unlinkAsync(source).catch(e => { })
					fs.unlinkAsync(dest).catch(e => { })
				}
				resolve(d)
			}).catch(function (e) {
				if (!options.debug) {
					fs.unlinkAsync(source).catch(e => { })
					fs.unlinkAsync(dest).catch(e => { })
				}
				resolve(e)
			})
		}
		catch (e) {/*System_Error*/
			resolve(new Result(options.result.System_Error, -1, e))
		}
	})
}
/**
 * default result object
 * can be access by require('simple-judger').Result
 * @typedef {object} Result
 * @property {string=} Accepted default: AC
 * @property {string=} Runtime_Error default: RE
 * @property {string=} Time_Limit_Exceeded default: TLE
 * @property {string=} Compile_Error default: CE
 * @property {string=} Wrong_Answer default: WA
 * @property {string=} System_Error default: SE
 */
judge.Result = {
	Accepted: 'AC',
	Runtime_Error: 'RE',
	Time_Limit_Exceeded: 'TLE',
	Compile_Error: 'CE',
	Wrong_Answer: 'WA',
	System_Error: 'SE'
}
module.exports = judge

function fx(s) {
	s = s.replace(/(\r\n|\r)/g, '\n')//crlf convert
	if (s.endsWith('\n')) s = s.slice(0, -1)//remove empty line
	return s
}
function write(source, code) {
	return fs.writeFileAsync(source, code)
}
function compile(cmd, ce) {
	return new Promise(function (resolve, reject) {
		var c_process = cp.exec(cmd)
		var c_out = ''
		c_process.on('error', function (e) {
			reject(new Result(ce, -1, c_out))
		})
		c_process.on('data', function (s) {
			c_out += s.toString()
		})
		c_process.on('exit', function (code, sig) {
			if (code != 0) {/*Compile_Error*/
				reject(new Result(ce, -1, c_out))
			}
			else {
				resolve(0)
			}
		})
	})
}
function exec(cmd, input, output, limit, result) {
	return new Promise(function (resolve, reject) {
		var px = cp.exec(cmd)
		var starttime = Date.now()
		px.stdin.write(input)
		var out = ''
		px.on('error', function (e) {
			reject(new Result(result.System_Error, -1, e))
		})
		px.stdout.on('data', function (s) {
			if (s.toString() === '<<entering SECCOMP mode>>\n') {
				starttime = Date.now()/*real start time*/
				return
			}
			else out += s.toString()
		})
		px.on('close', function (code) {
			var time = Date.now() - starttime
			if (code != 0) {/*Runtime_Error*/
				reject(new Result(result.Runtime_Error, time, out))
			}
			else if (fx(out) === fx(output)) {/*Accepted*/
				resolve(new Result(result.Accepted, time, out))
			}
			else {/*Wrong_Answer*/
				reject(new Result(result.Wrong_Answer, time, out))
			}
			px = null
		})
		setTimeout(function () {/*Time_Limit_Exceeded*/
			if (!px) return
			px.kill()
			reject(new Result(result.Time_Limit_Exceeded, Date.now() - starttime, out))
		}, limit)
	})
}

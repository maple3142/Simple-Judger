var cp = require('child_process')
module.exports = function (cmd, limit, input) {
	return new Promise(function (res, rej) {
		var start=Date.now()
		var px = cp.exec(cmd)
		px.stdin.write(input)
		var out = ''
		px.on('error', function (e) {
			rej({
				type: 'SE',
				error:　e
			})
			console.error(e)
			px=null
		})
		px.stdout.on('data', function (d) {
			out+=d.toString()
		})
		px.on('close', function (code) {
			if(code==null)return
			var time = Date.now() - start
			res({
				code: code,
				time: time,
				output: out
			})
			px=null
		})
		setTimeout(function () { 
			if (!px) return
			px.kill()
			rej({
				type: 'TLE',
				time: Date.now() - start,
				output: out
			})
			px=null
		},limit)
	})
}
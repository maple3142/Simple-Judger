Error.stackTraceLimit = Infinity

const Promise = require('bluebird')
const fs = require('fs')
const sj = require('../index.js')
const should = require('should')
const options = {
	src: fs.readFileSync(__dirname+'/test.cpp'),
	in: '2 5\n',
	out: '7',
	timelimit: 1000, 
	compile: 'g++ -o {dest} {source}'
}

describe('judge test', function () {
	this.timeout(10000)
	it('AC', done => {
		let opt = Object.assign({}, options)
		sj(opt).then(r => {
			r.result.should.equal('AC')
			done()
		})
	})
	it('WA', done => {
		let opt = Object.assign({}, options)
		opt.out=''
		sj(opt).then(r => {
			r.result.should.equal('WA')
			done()
		})
	})
	it('TLE', done => {
		let opt = Object.assign({}, options)
		opt.timelimit = 0
		sj(opt).then(r => {
			r.result.should.equal('TLE')
			done()
		})
	})
	it('CE', done => {
		let opt = Object.assign({}, options)
		opt.src = ''
		sj(opt).then(r => {
			r.result.should.equal('CE')
			done()
		})
	})
	it('CE: #include "/dev/random"', done => {/* this test may be slow */
		let opt = Object.assign({}, options) 
		opt.src = `#include "/dev/random"`
		sj(opt).then(r => {
			r.result.should.equal('CE')
			done()
		})
	})
	it('RE', done => {
		let opt = Object.assign({}, options)
		opt.src = `#include<iostream>
		using namespace std;
		
		int main(void){
			int a,b;
			cin>>a>>b;
			cout<<a+b<<endl;
			return 1;
		}
		`
		sj(opt).then(r => {
			r.result.should.equal('RE')
			done()
		})
	})
})

describe('default Results', function () {
	it('AC', () => {
		should(sj.Result.Accepted).equal('AC')
	})
	it('WA', () => {
		should(sj.Result.Wrong_Answer).equal('WA')
	})
	it('CE', () => {
		should(sj.Result.Compile_Error).equal('CE')
	})
	it('SE', () => {
		should(sj.Result.System_Error).equal('SE')
	})
	it('TLE', () => {
		should(sj.Result.Time_Limit_Exceeded).equal('TLE')
	})
	it('RE', () => {
		should(sj.Result.Runtime_Error).equal('RE')
	})
})
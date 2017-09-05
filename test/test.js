const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const sj = require('../index.js')
const should = require('should')
const options = {
	src: `#include<iostream>
	using namespace std;
	
	int main(void){
		int a,b;
		cin>>a>>b;
		cout<<a+b<<endl;
		return 0;
	}
	`,
	in: '2 5\n',
	out: '7',
	timelimit: 1000, 
	compile: 'g++ -o {dest} {source}'
}

describe('judge test', function () {
	this.timeout(1000)
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
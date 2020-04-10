const chai = require('chai');
const chaiHTTP = require('chai-http');
chai.use(chaiHTTP);
const assert = chai.assert;
const expect = chai.expect;
const server = require('../server').httpserver;

describe('Authentication', function() {
    describe('/login authentication rooute', function() {
        it('should should redirect to / if details are correct', function(done) {
            chai.request(server)
            .post('/login')
            .send({
                username: 'judge',
                password: 'test'
            })
            .end(function(err, res) {
                expect(res).to.redirectTo('http://127.0.0.1:8080/');
                done();
            })
        })
    })
})
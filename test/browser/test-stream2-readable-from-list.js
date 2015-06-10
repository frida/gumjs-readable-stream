'use strict';
var common = require('../common');
var fromList = require('../../lib/_stream_readable')._fromList;


module.exports = function (t) {
  t.test('buffers', function(t) {
    // have a length
    var len = 16;
    var list = [ new Buffer('foog'),
                 new Buffer('bark'),
                 new Buffer('bazy'),
                 new Buffer('kuel') ];

    // read more than the first element.
    var ret = fromList(6, { buffer: list, length: 16 });
    t.equal(ret.toString(), 'foogba');

    // read exactly the first element.
    ret = fromList(2, { buffer: list, length: 10 });
    t.equal(ret.toString(), 'rk');

    // read less than the first element.
    ret = fromList(2, { buffer: list, length: 8 });
    t.equal(ret.toString(), 'ba');

    // read more than we have.
    ret = fromList(100, { buffer: list, length: 6 });
    t.equal(ret.toString(), 'zykuel');

    // all consumed.
    t.same(list, []);

    t.end();
  });

  t.test('strings', function(t) {
    // have a length
    var len = 16;
    var list = [ 'foog',
                 'bark',
                 'bazy',
                 'kuel' ];

    // read more than the first element.
    var ret = fromList(6, { buffer: list, length: 16, decoder: true });
    t.equal(ret, 'foogba');

    // read exactly the first element.
    ret = fromList(2, { buffer: list, length: 10, decoder: true });
    t.equal(ret, 'rk');

    // read less than the first element.
    ret = fromList(2, { buffer: list, length: 8, decoder: true });
    t.equal(ret, 'ba');

    // read more than we have.
    ret = fromList(100, { buffer: list, length: 6, decoder: true });
    t.equal(ret, 'zykuel');

    // all consumed.
    t.same(list, []);

    t.end();
  });
}

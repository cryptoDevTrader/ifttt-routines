'use strict';

const Https = require('https');
const log = require('./logger');

class IFTTT {
	constructor(key) {
		this.key = key;
	}

	makeRequest(options, callback) {
		const data = options.data || '';

		options = options.url || options;        

		log.debug('Options:', JSON.stringify(options));

		const req = Https.request(options, (res) => {
			let body = '';

			log.debug('Status:', res.statusCode);
			log.debug('Headers:', JSON.stringify(res.headers));

			res.setEncoding('utf8');

			res.on('data', (chunk) => body += chunk);

			res.on('end', () => {
				const content_type = res.headers['content-type'];

				if (content_type && content_type.match(/application\/(hal\+)?json/)) {
					body = JSON.parse(body);
				}

				log.debug('Response:', body);
				log.debug('==================================================');

				callback(null, body);
			});
		}).on('error', callback);

		req.write(JSON.stringify(data));
		req.end();
	}

	trigger(event, callback) {
		this.makeRequest({
			'method': 'GET',
			'hostname': 'maker.ifttt.com',
			'path': `/trigger/${event}/with/key/${this.key}`
		}, callback);
	}
}

module.exports = IFTTT;
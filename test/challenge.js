const micro = require('micro');
const listen = require('test-listen');
const fetch = require('isomorphic-fetch');
const test = require('ava');
const challenge = require('../api/challenge');

test( 'api/challenge', async t => {
	const service = micro( challenge );
	const url = await listen( service );
	const body = await fetch( url, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify( {
			challenge: 'anneka'
		} ),
	} );
	const json = await body.json();

	t.deepEqual( json.challenge, 'anneka' );
	service.close();
} );

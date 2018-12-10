require('now-env');
const micro = require('micro');
const listen = require('test-listen');
const fetch = require('isomorphic-fetch');
const test = require('ava');
const message = require('../api/message');
const { before, beforeEach, after } = require('./utils/_mongo');

// Before & after tests.
test.before( 'start db server', before );
test.beforeEach( 'setup db', beforeEach( {
	auths: [ {
		team_id: 'T1234567',
		user_id: 'U1234567',
		access_token: 'xxxp-1234567-1234567890',
	} ]
} ) );
test.after.always( 'teardown', after );

// Bad verification token
test.serial( 'api/message invalid token', async t => {
	const service = micro( message );
	const url = await listen( service );

	const response = await fetch( url, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify( {
			token: 'bad token',
		} ),
	} );

	t.is( response.status, 500 );

	const json = await response.json();

	t.deepEqual( json, { ok: false, error: 'womp womp' } );

	service.close();
} );

// Good verification token
test.serial( 'api/message valid token', async t => {
	t.plan(3);

	// Capture requests other than /
	const animateProxy = fn => ( req, res ) => {
		if ( req.url === '/api/animate' ) {
			t.pass();
			return micro.send( res, 200, { ok: true } );
		}

		return fn( req, res );
	}

	const service = micro( animateProxy( message ) );
	const url = await listen( service );

	const response = await fetch( url, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify( {
			token: process.env.SLACK_VERIFICATION_TOKEN,
			user_id: 'U1234567',
			team_id: 'T1234567',
			message: { text: '/animate' },
		} ),
	} );

	t.is( response.status, 200 );

	const json = await response.json();

	t.is( json.text.indexOf( ':scream_cat:' ), -1 );

	service.close();
} );

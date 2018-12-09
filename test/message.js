require('now-env');
const { MongoDBServer } = require( 'mongomem' );
const micro = require('micro');
const listen = require('test-listen');
const fetch = require('isomorphic-fetch');
const test = require('ava');
const message = require('../api/message');
const { setup } = require( '../utils/mongo' );

// Before & after tests.
test.before( 'start db server', async t => {
	await MongoDBServer.start();
	await setup( MongoDBServer, { auths: [ {
		team_id: 'T1234567',
		user_id: 'U1234567',
		access_token: 'xxxp-1234567-1234567890',
	} ] } );
} );

test.after.always( 'teardown', t => {
	MongoDBServer.tearDown();
} );

// Bad verification token
test( 'api/message invalid token', async t => {
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

	t.deepEqual( json, { error: 'womp womp' } );

	service.close();
} );

// Good verification token
test( 'api/message valid token', async t => {
	const service = micro( message );
	const url = await listen( service );

	const urls = [
		'/',
		'/api/animate',
	];

	// Listen for POST to animate.
	t.plan(3);
	service.on( 'request', async ( req, res ) => {
		t.is( req.url, urls.shift() );
		if ( req.url === '/api/animate' ) {
			res.writeHead( 200, { 'Content-type': 'application/json' } );
			res.end( JSON.stringify( { animating: true } ) );
		}
	} );

	const response = await fetch( url, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify( {
			token: process.env.SLACK_VERIFICATION_TOKEN,
			user_id: 'U1234567',
			team_id: 'T1234567',
		} ),
	} );

	t.is( response.status, 200 );

	const json = await response.json();

	t.true( json.text.indexOf( ':scream_cat:' ) !== 0 );

	service.close();
} );

require('now-env');
const micro = require('micro');
const listen = require('test-listen');
const fetch = require('isomorphic-fetch');
const test = require('ava');
const exchange = require('../api/exchange');
const { getClient } = require('../api/utils/db');
const qs = require('querystring');
const Mitm = require('./utils/_mitm');
const { before, beforeEach, after } = require( './utils/_mongo' );

// Example failed slack oauth response.
const oauthResponseInvalid = {
	ok: false,
	error: 'invalid_code'
};

// Example failed slack oauth response.
const oauthResponseValid = {
	"ok": true,
	"access_token": "xxxp-1234567890-abcdefghij",
	"scope": "identify,commands,chat:write:user",
	"user_id": "U1234567",
	"team_name": "test",
	"team_id": "T1234567"
};

// Proxy slack.
const mitm = Mitm();
mitm.intercept( 'https://slack.com/api/oauth.access', ( req, res ) => {
	if ( req.body.code === '12345' ) {
		res.json( oauthResponseInvalid );
	} else {
		res.json( oauthResponseValid );
	}
} );

// Before & after tests.
test.before( 'start db server', before );
test.beforeEach( 'setup db', beforeEach( { auths: [] } ) );
test.after.always( 'teardown', t => {
	after();
	mitm.disable();
} );

// Invalid token
test.serial( 'api/exchange invalid token', async t => {
	const service = micro( exchange );
	const url = await listen( service );

	// Exchange code & state params.
	const args = {
		code: '12345',
		state: Buffer.from( '::ffff:127.0.0.1' ).toString( 'base64' ),
	};

	// Expected URLs.
	const urls = [
		`/?${qs.stringify( args )}`,
		`/error?${qs.stringify( oauthResponseInvalid )}`,
	];

	t.plan(2);
	service.on( 'request', async ( req ) => {
		t.is( req.url, urls.shift() );
	} );

	await fetch( `${url}?${qs.stringify( args )}` );

	service.close();
} );

// Valid token
test.serial( 'api/exchange valid token', async t => {
	const service = micro( exchange );
	const url = await listen( service );

	// Exchange code & state params.
	const args = {
		code: '67890',
		state: Buffer.from( '::ffff:127.0.0.1' ).toString( 'base64' ),
	};

	// Expected URLs.
	const urls = [
		`/?${qs.stringify( args )}`,
		`/boom`,
	];

	// 3 checks.
	t.plan(3);

	service.on( 'request', async ( req ) => {
		t.is( req.url, urls.shift() );
	} );

	await fetch( `${url}?${qs.stringify( args )}` );

	const client = await getClient();
	const db = await client.db();
	const auths = await db.collection( 'auths' );
	const auth = await auths.findOne( {
		user_id: 'U1234567',
		team_id: 'T1234567',
	} );

	if ( auth ) {
		t.pass();
	} else {
		t.fail();
	}

	service.close();
} );

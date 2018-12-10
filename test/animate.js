require('now-env');
const micro = require('micro');
const listen = require('test-listen');
const fetch = require('isomorphic-fetch');
const test = require('ava');
const animate = require('../api/animate');
const Mitm = require('./utils/_mitm');

const mitm = Mitm();
mitm.intercept( 'https://slack.com/api/chat.postMessage', ( req, res ) => {
	const { channel_id, text } = req.body;
	res.json( {
		ok: true,
		ts: Date.now(),
		channel_id: channel_id,
		text: text,
	} );
} );
mitm.intercept( 'https://slack.com/api/chat.update', ( req, res ) => {
	const { channel_id, text, ts } = req.body;
	res.json( {
		ok: true,
		ts: ts,
		channel_id: channel_id,
		text: text,
	} );
} );

// Successful request
test( 'api/animate successful series', async t => {
	t.plan(19);

	// Animation message to send.
	const message = {
		text: `/animate delay=.1 loop=2
frame1
frame2
frame3`,
		channel_id: 'C1234567'
	};

	const expectedRequests = [
		{ frame: undefined, loop: undefined, text: undefined },
		{ frame: 1, loop: 0, text: 'frame2' },
		{ frame: 2, loop: 0, text: 'frame3' },
		{ frame: 0, loop: 1, text: 'frame1' },
		{ frame: 1, loop: 1, text: 'frame2' },
		{ frame: 2, loop: 1, text: 'frame3' },
	];

	const testProxy = fn => async ( req, res ) => {
		const expected = expectedRequests.shift();
		const body = await micro.json( req );

		t.is( expected.text, body.text );
		t.is( expected.frame, body.frame );
		t.is( expected.loop, body.loop );

		return fn( req, res );
	};

	const service = micro( testProxy( animate ) );
	const url = await listen( service );

	const response = await fetch( url, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify( {
			token: '1234567',
			message: message,
		} ),
	} );
	const json = await response.json();

	t.deepEqual( json, { ok: true, completed: false } );

	service.close();
} );

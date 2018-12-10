const fetch = require('isomorphic-fetch');
const { getClient } = require('./utils/db');
const { blessup } = require('./utils/server');
const qs = require('querystring');

// Exchange oauth token.
module.exports = blessup( async ( req, res ) => {
	const { code, state } = req.query;
	let client;

	if ( ! code ) {
		return res.json( { error: 'no token exchange code' }, 500 );
	}

	if ( state !== Buffer.from( res.socket.remoteAddress ).toString( 'base64' ) ) {
		return res.json( { error: 'incorrect session detected' }, 500 );
	}

	try {
		// Post token exchange code.
		const response = await fetch( 'https://slack.com/api/oauth.access', {
			method: 'POST',
			headers: {
				'Content-type': 'application/x-www-form-urlencoded',
			},
			body: qs.stringify( {
				client_id: process.env.SLACK_CLIENT,
				client_secret: process.env.SLACK_SECRET,
				code: code,
				redirect_uri: `https://${req.headers.host}/connect/exchange`,
			} ),
		} );

		const json = await response.json();

		if ( ! json.ok ) {
			throw json;
		}

		client = await getClient();
		const db = await client.db();
		const auths = await db.collection( 'auths' );
		const doc = await auths.findOne( {
			user_id: json.user_id,
			team_id: json.team_id,
		} );

		if ( ! doc ) {
			await auths.insertOne( json );
		} else {
			await auths.replaceOne( {
				user_id: doc.user_id,
				team_id: doc.team_id,
			}, json );
		}

		await client.close();

		return res.redirect( '/boom', 302 );
	} catch ( err ) {
		client && await client.close();
		const errorQuery = err.error ? err : {};
		return res.redirect( `/error?${qs.stringify( errorQuery )}`, 302 );
	}
} );

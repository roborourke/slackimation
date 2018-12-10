const fetch = require('isomorphic-fetch');
const { getClient } = require('../utils/db');
const { blessup, selfURL } = require('../utils/server');

module.exports = blessup( async ( req, res ) => {
	let client;

	if ( req.body.token !== process.env.SLACK_VERIFICATION_TOKEN ) {
		return res.json( { ok: false, error: 'womp womp' }, 500 );
	}

	try {
		client = await getClient();
		const db = await client.db();
		const auths = await db.collection( 'auths' );
		const auth = await auths.findOne( {
			user_id: req.body.user_id,
			team_id: req.body.team_id,
		} );

		await client.close();

		if ( ! auth ) {
			throw { error: 'no_auth' };
		}

		// Fire off the animation request async.
		const response = await fetch( selfURL( req, '/api/animate' ), {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
			},
			body: JSON.stringify( {
				token: auth.access_token,
				message: req.body,
				type: 'start',
			} ),
		} );

		const animating = await response.json();

		if ( ! animating.ok ) {
			return res.json( {
				text: ':scream_cat: The animation failed to do animatey things!',
			} );
		}

		// add whimsy
		var mojibank = [
			':boom:',
			':grin:',
			':popcorn:',':popcorn:',':popcorn:',':popcorn:',':popcorn:',
			':eyes:', ':eyes:', ':eyes:', ':eyes:', ':eyes:',
			':raised_hands:',
			':sunglasses:',
			':ghost:',
			':the_horns:',
			':see_no_evil:',
			':hear_no_evil:',
			':speak_no_evil:',
			':eggplant:',
			':pizza:', ':pizza:', ':pizza:'
			],
			newmoji,
			mojis = [];

		while ( mojis.length < 3 ) {
			newmoji = Math.round( Math.random() * ( mojibank.length - 1 ) );
			if ( mojis.indexOf( mojibank[ newmoji ] ) < 0 )
				mojis = mojis.concat( mojibank.splice( newmoji, 1 ) );
		}

		return res.json( {
			text: mojis.join( ' ' ),
		} );
	} catch ( err ) {
		client && await client.close();
		return res.json( {
			text: `:scream_cat: I couldn\'t find your slack credentials! ` +
				`Try signing in over at <${selfURL(req)}/>`
		} )
	}
} )

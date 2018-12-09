// Redirect to Slack OAuth
const qs = require('querystring');

module.exports = ( req, res ) => {
	const query = {
		state: Buffer.from( res.socket.remoteAddress ).toString( 'base64' ),
		client_id: process.env.SLACK_CLIENT,
		scope: 'commands chat:write:user',
		redirect_uri: `https://${req.headers.host}/connect/exchange`
	};

	res.writeHead( 301, { Location: `https://slack.com/oauth/authorize?${qs.stringify( query )}` } );
	res.end();
}

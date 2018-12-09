const url = require('url');
const qs = require('querystring');
const { json, text, buffer, send } = require('micro');

const blessup = fn => async ( req, res ) => {
	res.status = status => {
		res.writeHead( status );
		return res;
	}

	res.json = ( data, status = 200 ) => {
		send( res, status, data );
	}

	res.redirect = ( url, status = 301 ) => {
		res.writeHead( status, {
			Location: url
		} );
		send( res, status );
	};

	if ( req.method === 'POST' ) {
		switch ( req.headers['content-type'] ) {
			case 'application/json':
				req.body = await json( req );
				break;
			case 'application/x-www-form-urlencoded':
				req.body = await buffer( req );
				req.body = qs.parse( req.body.toString() );
				break;
			default:
				req.body = await text( req );
		}
	}

	if ( req.method === 'GET' ) {
		req.query = url.parse( req.url, true, true ).query;
	}

	return await fn( req, res );
}

const selfURL = ( req, urlpath = '' ) => {
	const { host } = req.headers;
	urlpath = urlpath.replace( /^\/*/, '' );

	if ( host.match( /localhost/ ) ) {
		return `http://${host}/${urlpath}`;
	}

	return `https://${host}/${urlpath}`;
}

module.exports = {
	blessup,
	selfURL,
}

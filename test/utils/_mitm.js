const Mitm = require('mitm');
const { blessup } = require('../../api/utils/server');
const { parse } = require('url');

module.exports = () => {
	const mitm = Mitm();

	// ignore localhost.
	mitm.on( "connect", ( socket, opts ) => {
		if ( opts.host.match( /(localhost|127\.0\.0\.1)/ ) ) {
			socket.bypass();
		}
	} );

	// simple response helper.
	mitm.intercept = ( url, fn ) => {
		const parsedURL = parse( url );
		mitm.on( 'request', blessup( ( req, res ) => {
			if ( req.url === parsedURL.path && req.headers.host === parsedURL.host ) {
				fn( req, res );
			}
		} ) );
	}

	return mitm;
}

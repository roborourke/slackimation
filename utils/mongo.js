require('now-env');
const { getClient } = require('./db');
const { parse } = require('url');

const setup = async ( db, data = {} ) => {
	db.debug = true;
	const uri = await db.getConnectionString();
	const parsedURI = parse( uri );

	// Patch env vars.
	process.env.DB_HOST = parsedURI.hostname;
	process.env.DB_PORT = parsedURI.port;
	process.env.DB_NAME = parsedURI.path.replace( /^\/*/, '' );

	console.log( 'setup', db )

	const client = await getClient();
	const database = await client.db();

	Object.entries( data ).map( async ( [ key, value ] ) => {
		const collection = await database.createCollection( key );
		if ( value.length > 0 ) {
			await collection.insertMany( value );
		}
	} );
}

module.exports = {
	setup,
};

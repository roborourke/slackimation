require('now-env');
const MongodbMemoryServer = require('mongodb-memory-server').default;
const { getClient } = require('../../api/utils/db');
const { parse } = require('url');

const mongod = new MongodbMemoryServer();

const before = async t => {
	const uri = await mongod.getConnectionString();
	const parsedURI = parse( uri );

	// Patch env vars.
	process.env.DB_HOST = parsedURI.hostname;
	process.env.DB_PORT = parsedURI.port;
	process.env.DB_NAME = parsedURI.path.replace( /^\/*/, '' );
}

const beforeEach = ( data = {} ) => async t => {
	t.context.dbData = data;

	const client = await getClient();
	const database = await client.db();

	// Drop all existing data.
	const collections = await database.listCollections( {}, { nameOnly: true } ).toArray();
	collections.forEach( async collection => {
		await database.dropCollection( collection.name );
	} );

	// Create initial data.
	Object.entries( data ).map( async ( [ key, value ] ) => {
		try {
			const collection = await database.createCollection( key );
			if ( value.length > 0 ) {
				await collection.insertMany( value );
			}
		} catch ( err ) {
			// @todo research intermittent 'collection already exists' bug.
		}
	} );

	client.logout();
}

const after = t => {
	mongod.stop();
}

module.exports = {
	before,
	beforeEach,
	after,
};

require('now-env');
const test = require('ava');
const { getClient } = require('../utils/db');
const { before, beforeEach, after } = require('../utils/mongo');

test.before( 'start db server', before );
test.beforeEach( 'setup', beforeEach( { test: [] } ) );
test.after.always( 'teardown', after );

test( 'api/db', async t => {
	const client = await getClient();
	const database = await client.db();
	const collection = await database.collection( 'test' );
	const doc = await collection.findOne( { id: 1 } );

	const data = { id: 1, foo: 'bar' };

	if ( ! doc ) {
		await collection.insertOne( data );
	} else {
		await collection.replaceOne( { id: 1 }, data );
	}

	const finalDoc = await collection.findOne( { id: 1 } );

	t.deepEqual( finalDoc.foo, data.foo );
	client.close();
} );

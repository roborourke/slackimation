require('now-env');
const test = require('ava');
const { MongoDBServer } = require('mongomem');
const { getClient } = require('../utils/db');
const { setup } = require('../utils/mongo');

test.before( 'start db server', async t => {
	await MongoDBServer.start();
	await setup( MongoDBServer, { test: [] } );
} );

test.after.always( 'teardown', t => {
	MongoDBServer.tearDown();
} );

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
	await client.close();
} );

const MongoClient = require('mongodb').MongoClient;

const dbUri = () => {
      const auth = process.env.DB_USER && process.env.DB_PASS
            ? `${process.env.DB_USER}:${process.env.DB_PASS}@`
            : '';
      const url = `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

      return `mongodb://${auth}${url}`;
}

const getClient = async () => {
      return await MongoClient.connect( dbUri(), {
            useNewUrlParser: true,
      } );
}

module.exports = {
      getClient,
      dbUri,
}

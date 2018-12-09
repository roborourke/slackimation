const { blessup } = require('../utils/server');

module.exports = blessup( async ( req, res ) => res.json( { challenge: req.body.challenge } ) );

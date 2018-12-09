const fetch = require('isomorphic-fetch');
const { blessup } = require('../utils/server');

module.exports = blessup( async ( req, res ) => {
  const { token, message } = req.body;

  if ( !token || !message ) {
    return res.status( 500 ).end( "womp womp" );
  }

  var postURL = "https://slack.com/api/chat.postMessage",
    updateURL = "https://slack.com/api/chat.update",
    lines = message.text.replace(/\r/g, "").split(/\n/),
    commands = lines.shift(),
    delay,
    loop,
    frames = lines.slice(0),
    data = {
      token: token,
      channel: message.channel_id,
      as_user: true,
      parse: "full"
    },
    nextFrame = async ( response, type ) => {
      if ( !data.ts && "update" === type ) {
        data.ts = response.ts;
      }

      if ( frames.length ) {
		data.text = "\u200B " + frames.shift();
		try {
			const rsp = await fetch( "update" === type ? updateURL : postURL, {
				method: "POST",
				headers: {
					'Content-type': 'application/json',
				},
				body: JSON.stringify( data ),
			} );
			const json = await rsp.json();

			if ( !json.ok ) {
				throw json;
			}

			return setTimeout( nextFrame, delay, json, "update" );
		} catch ( err ) {
            console.log( err );
        }
      } else {
        loop--;
        if ( loop > 0 ) {
          frames = lines.slice(0);
          return setTimeout( nextFrame, delay, {}, "update" );
        } else {
          return res.end( ":boom:" );
        }
      }
    };

  // parse commands
  delay = commands.match(/delay[=\s]+(\d+(\.\d+)?|(\.\d+))/);
  delay = delay ? parseFloat(delay[1] || 1) * 1000 : 1000;
  loop = commands.match(/loop[=\s]+(\d+)/);
  loop = loop ? Math.min(parseInt(loop[1] || 1, 10), 50) : 1;

  return nextFrame( {}, "post" );
} );

const fetch = require('isomorphic-fetch');
const { blessup, selfURL } = require('./utils/server');

module.exports = blessup( async ( req, res ) => {
  const start = Date.now();
  const { token, message, ts = null } = req.body;
  let { frame = 0, loop = 0, elapsed = 0 } = req.body;

  if ( ! token || ! message ) {
    return res.json( { ok: false, error: "womp womp" }, 500 );
  }

  try {

    const messageData = {
      token: token,
      channel: message.channel_id,
      as_user: true,
      parse: "full",
    };

    // Parse message text.
    const lines = message.text.replace( /\r/g, '' ).split( /\n/ );
    const commands = lines.shift();
    const frames = lines.slice();

    if ( frames.length < 1 ) {
      return res.json( { ok: false, error: 'No frames' }, 200 );
    }

    // Parse commands.
    let delay = commands.match( /delay[=\s]+(\d+(\.\d+)?|(\.\d+))/ );
    delay = delay ? parseFloat( delay[1] || 1 ) * 1000 : 1000;
    let loops = commands.match( /loop[=\s]+(\d+)/ );
    loops = loops ? Math.min( parseInt( loop[1] || 1, 10 ), 20 ) : 1;

    let url;

    // Start message.
    if ( frame === 0 && loop === 0 ) {
      url = "https://slack.com/api/chat.postMessage";
    } else {
      url = "https://slack.com/api/chat.update";
      // Set the timestamp to update.
      messageData.ts = ts;
    }

    // Set the frame text.
    messageData.text = "\u200B " + frames[ frame ];

    const slackResponse = await fetch( url, {
      method: "POST",
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify( messageData ),
    } );

    const json = await slackResponse.json();

    if ( ! json.ok ) {
      throw json;
    }

    // escape if we've finished.
    if ( frame + 1 === frames.length && loop === loops ) {
      return res.json( { ok: true, completed: true } );
    }

    // back to the first frame.
    if ( frame + 1 === frames.length ) {
      loop++;
      frame = 0;
    } else {
      frame++;
    }

    const frameData = {
      token: token,
      message: message,
      text: frames[ frame ],
      frame: frame,
      loop: loop,
      ts: json.ts,
    };

    // Remove time taken from timeout.
    const offset = Date.now() - start;

    // Post again to self with current frame, loop & ts.
    setTimeout( async () => {
      await fetch( selfURL( req, '/api/animate' ), {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify( frameData ),
      } );

      res.json( { ok: true, completed: false }, 200 );
    }, Math.max( 25, delay - offset ) );

  } catch ( err ) {
    return res.json( { ok: false, error: err } );
  }

} );

var request = require('request-promise');

module.exports = (req, res) => {

  const { token, message } = req.body;

  if ( ! token || ! message ) {
    console.log(req.body)
    return res.status(500).send('womp womp');
  }

  var args = req.body,
      postURL = 'https://slack.com/api/chat.postMessage',
      updateURL = 'https://slack.com/api/chat.update',
      lines = args.message.text.replace(/\r/g,'').split(/\n/),
      commands = lines.shift(),
      delay,
      loop,
      frames = lines.slice(0),
      data = {
        token: args.token,
        channel: args.message.channel_id,
        as_user: true,
        parse: 'full'
      },
      nextFrame = function(response, type) {
        if (! data.ts && 'update' === type) {
          data.ts = response.ts;
        }

        if (frames.length) {
          data.text = '\u200B ' + frames.shift();
          request({
            method: 'POST',
            uri: 'update' === type ? updateURL : postURL,
            form: data
          })
          .then(function(response){
            response = JSON.parse(response);
            if (!response.ok) {
              throw response;
            }
            setTimeout(nextFrame, delay, response, 'update');
          })
          .catch(function(err){
            console.log(err);
          });
        } else {
          loop--;
          if (loop>0) {
            frames = lines.slice(0);
            setTimeout(nextFrame, delay, {}, 'update');
          } else {
            res.send(':boom:');
          }
        }
      };

  // parse commands
  delay = commands.match(/delay[=\s]+(\d+(\.\d+)?|(\.\d+))/);
  delay = delay ? parseFloat( delay[1] || 1 ) * 1000 : 1000;
  loop = commands.match(/loop[=\s]+(\d+)/);
  loop = loop ? Math.min( parseInt( loop[1] || 1, 10 ), 50 ) : 1;

  nextFrame({}, 'post');
};

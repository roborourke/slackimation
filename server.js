var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var handlebars = require('express-handlebars');
var session = require('express-session');
var MongoClient = require('mongodb').MongoClient;
var MongoStore = require('connect-mongo')(session);
var threads = require('threads'),
    spawn = threads.spawn;
var Grant = require('grant-express'),
    grant = new Grant({
      server: {
        protocol: "https",
        host: "charm-chest.hyperdev.space",
        callback: "/ready"
      },
      slack: {
        key: process.env.SLACK_CLIENT,
        secret: process.env.SLACK_SECRET,
        scope: [ 'chat:write:user' ]
      }
    });
    
var mongoURL = 'mongodb://' +
      process.env.DB_USER + ':' +
      process.env.DB_PASS + '@' +
      process.env.DB_HOST + ':' +
      process.env.DB_PORT + '/' +
      process.env.DB_NAME;
      
var mongodb = () => MongoClient.connect(mongoURL);
    
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ url: mongoURL })
}));
app.use(grant);

// Save the access token on return
app.get("/ready", function(req, res){
  var db,
      auths,
      done = function(url) {
        db.close();
        res.redirect(url || '/');
      };

  // easier matching later on
  req.query.user_id = req.query.raw.user_id;
  req.query.team_id = req.query.raw.team_id;

  mongodb()
    .then(function(database){
      db = database;
      return db.collection('auths');
    })
    .then(function(collection){
      auths = collection;
      return auths.findOne({
        user_id: req.query.user_id, 
        team_id: req.query.team_id
      });
    })
    .then(function(doc){
      if (!doc) {
        return auths.insertOne(req.query);
      } else {
        return auths.replaceOne({
          user_id: req.query.user_id,
          team_id: req.query.team_id
        }, req.query);
      }
    })
    .then(function(){
      done('/boom');
    })
    .catch(function(err){
      console.log(err);
      done('/error');
    });
});

// Slash command
app.post("/", function (req, res) {
  
  if (req.body.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    res.sendStatus(500);
  }
        
  // fetch access_token from mongodb
  mongodb()
    .then(db => db.collection('auths'))
    .then(collection => collection.findOne({ 
      user_id: req.body.user_id, 
      team_id: req.body.team_id 
    }))
    .then(function(doc){
      // start posting to slack editing the message for each line
      spawn('animate.js').send({
        token: doc.access_token,
        message: req.body
      });
      
      // add whimsy
      var mojibank = [
        ':boom:',
        ':grin:',
        ':popcorn:',':popcorn:',':popcorn:',':popcorn:',':popcorn:',
        ':eyes:', ':eyes:', ':eyes:', ':eyes:', ':eyes:',
        ':raised_hands:',
        ':sunglasses:',
        ':ghost:',
        ':the_horns:',
        ':see_no_evil:',
        ':hear_no_evil:',
        ':speak_no_evil:',
        ':eggplant:',
        ':pizza:', ':pizza:', ':pizza:'
        ],
        newmoji,
        mojis = [];
      
      while(mojis.length < 3) {
        newmoji = Math.round( Math.random() * (mojibank.length - 1) );
        if (mojis.indexOf(mojibank[newmoji]) < 0)
          mojis = mojis.concat( mojibank.splice(newmoji,1) );
      }
      
      res.json({
        text: mojis.join( ' ' )
      });
    })
    .catch(function(err){
      res.json({
        text: ':scream_cat: I couldn\'t find your slack credentials! ' +
          'Try signing in over at <https://charm-chest.hyperdev.space/>'
      });
    });
});

// Slack events API responder
app.post("/challenge", function (request, response) {
  response.json({
    challenge: request.body.challenge
  });
});

// Use handlebars view engine
app.engine('handlebars', handlebars.create( {
  defaultLayout: 'main'
} ).engine );
app.set('view engine', 'handlebars');
app.enable('view cache');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.viewData = {
  title: 'Animator!',
  state: process.env.SLACK_VERIFICATION_TOKEN
};

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.render('index', Object.assign({
  }, app.viewData));
});

app.get("/boom", function (request, response) {
  response.render('success', Object.assign({
  }, app.viewData));
});

app.get("/error", function (request, response) {
  response.render('error', Object.assign({
  }, app.viewData));
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
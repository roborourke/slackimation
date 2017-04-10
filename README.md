Slackimation
============

Animated slack messages... Need I say more.

## Usage

Add the app to your slack team or if it's already there then just sign in!

If you're running it yourself as your own app then you'll need a `.env` file
like this one with the values filled in:

```
# Environment Config

# For grant-express
SESSION_SECRET=

# Slack credentials
SLACK_VERIFICATION_TOKEN=
SLACK_CLIENT=
SLACK_SECRET=
SLACK_STATE=

# MongoDB settings eg. with mlab.com
DB_HOST=
DB_PORT=
DB_NAME=
DB_PASS=
DB_USER=

# Optional URL to use when NODE_ENV == production
URL=

# note: .env is a shell file so there can't be spaces around '=
```

## Credits

Shamelessly robbed from [@mroth's slacknimate](https://github.com/mroth/slacknimate)

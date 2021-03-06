import React from 'react'
import App, { Container } from 'next/app'
import Head from 'next/head'
import Link from 'next/link'

export default class MyApp extends App {
	static async getInitialProps( { Component, router, ctx } ) {
		let pageProps = {}

		if (Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx)
		}

		return { pageProps }
	}

	render () {
		const { Component, pageProps } = this.props

		return (
			<Container>
				<Head>
					<title>Slackimation</title>
					<meta name="description" content="Animated slack messages! 📽" />
					<link id="favicon" rel="icon" href="/static/favicon.png" type="image/png" />
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link href="//fonts.googleapis.com/css?family=Bungee+Inline|Bungee+Shade|Lato|Monoton" rel="stylesheet" />
				</Head>
				<header>
					<h1>Slackimation!</h1>
				</header>
				<main>
					<Component {...pageProps} />
				</main>
				<footer>
					made by <a href="https://github.com/roborourke">@roborourke</a><br />
					shamelessly robbed from <a href="https://github.com/mroth/slacknimate">mroth</a><br />
					<br />
					<a href="https://twitter.com/robertorourke">support</a> | <Link href="/privacy">privacy</Link>
				</footer>
				<style global jsx>{`
				  body {
					font: 16px/1.45 Lato;
					margin: 0 auto;
					text-align: center;
					padding: 0 0 200px 0;
					color: #454545;
				  }

				  @media only screen and (min-width: 600px) {
					body {
					  font: 20px/1.45 Lato;
					}
				  }

				  main,
				  footer {
					margin: 0 auto;
					max-width: 600px;
					padding: 0 20px;
				  }

				  h1, h2, h3 {
					text-transform: uppercase;
					font-weight: 900;
					text-align: center;
				  }

				  @-webkit-keyframes titleBG {
					  0%{background-position:97% 0%}
					  50%{background-position:4% 100%}
					  100%{background-position:97% 0%}
				  }
				  @-moz-keyframes titleBG {
					  0%{background-position:97% 0%}
					  50%{background-position:4% 100%}
					  100%{background-position:97% 0%}
				  }
				  @keyframes titleBG {
					  0%{background-position:97% 0%}
					  50%{background-position:4% 100%}
					  100%{background-position:97% 0%}
				  }

				  h1 {
					font-family: "Bungee Shade", sans-serif;
					font-size: 150%;
					margin: 20px;
					text-transform: uppercase;
					font-weight: 900;

					background: linear-gradient(320deg, #e19216, #e5de2c, #31dc2d, #2dd6dc, #2d72dc, #d02ddc, #dc2d36);
					background-size: 1400% 1400%;

					-webkit-animation: titleBG 10s ease infinite;
					-moz-animation: titleBG 10s ease infinite;
					animation: titleBG 10s ease infinite;

					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
				  }

				  @media only screen and (min-width: 360px) {
					h1 {
					  font-size: 200%;
					  margin: 30px 20px;
					}
				  }

				  @media only screen and (min-width: 600px) {
					h1 {
					  font-size: 300%;
					  margin: 50px 20px;
					}
				  }

				  pre,
				  code {
					font-family: Monaco, monospace;
					font-size: 90%;
					padding: 0 3px;
					background: #f5f5f5;
					border: 2px solid #ddd;
					color: #c00;
					border-radius: 3px;
				  }

				  .intro {
					font-size: 110%;
				  }

				  .intro .img-wrap {
					overflow: hidden;
				  }

				  .img-wrap img {
					display: block;
					border: 0;
					margin: -1px 0;
					max-width: 100%;
					height: auto;
				  }

				  section {
					margin: 40px 0;
				  }

				  a {
					color: #757575;
				  }

				  pre {
					text-align: left;
					font-size: 62.5%;
					overflow: auto;
				  }

				  footer {
					color: #ccc;
					font-size: 75%;
				  }

				`}</style>
			</Container>
		)
	}
}

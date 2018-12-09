import { Fragment } from 'react'
import AddToSlack from '../components/add-to-slack';
import SignInWithSlack from '../components/sign-in-with-slack';

export default () => (
	<Fragment>
		<section className="fail">
			<h2>Booerns 💩</h2>
			<p>
				Something went awry. Maybe nag <a href="https://twitter.com/robertorourke">Rob</a> on
				twitter to add some proper error messages&hellip; 🙄
			</p>
			<p>
				In the meantime you could try the login / add to slack process again.
			</p>
		</section>

		<section className="add-to-slack">
			<p>
				<AddToSlack />
			</p>
			<p>or</p>
			<p>
				<SignInWithSlack />
			</p>
		</section>
	</Fragment>
)

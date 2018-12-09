import { Fragment } from 'react';
import AddToSlack from '../components/add-to-slack';
import SignInWithSlack from '../components/sign-in-with-slack';

export default () => (
	<Fragment>
		<section className="intro">
			<div className="img-wrap">
				<img src="/static/animator.gif" alt="Go Animator Go!" />
			</div>
			<p>
				Use the slash command <code>/animate</code>, set the <code>delay</code>
				and the number of times it should <code>loop</code>, then every line of text
				after that is a frame of your animation!
			</p>
			<p className="add-to-slack">
				<AddToSlack />
			</p>
		</section>

		<section className="sign-in-to-slack">
			<p>Already have the app installed for your team?<br />
				Sign in to start animating 🙌</p>
			<SignInWithSlack />
		</section>
	</Fragment>
)

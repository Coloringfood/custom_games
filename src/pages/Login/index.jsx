import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './Login.css';

/**
 * @typedef UserObject
 * @type {object}
 * @property {string} username - Represents the user's ID
 * @property {string} name - users display name
 */
const Login = ({ setActiveUser, activeUser, previousLocation }) => {
	const navigate = useNavigate();
	const [loginData, setLoginData] = useState({});
	const [attempted, setAttempted] = useState(false);

	useEffect(() => {
		const loadedName = window.localStorage.getItem('username');
		const loggedIn = window.localStorage.getItem('loggedIn');

		if (loggedIn && !activeUser) {
			console.log(`BBBB auto logging in user ${loggedIn}`);
			setActiveUser({ username: loggedIn, password: ['Summer'] });
			navigate(previousLocation || '/profile');
			return;
		} else {
			// If hitting this page after logging in, log out
			window.localStorage.removeItem('loggedIn');
			setActiveUser(null);
		}
		if (loadedName) {
			setLoginData({ username: loadedName });
		}
	}, []);
	const handleSubmit = (e) => {
		e.preventDefault();
		setAttempted(true);
		if (loginData.password[0] !== 'Summer') return;
		window.localStorage.setItem('username', loginData.username);
		window.localStorage.setItem('loggedIn', loginData.username);
		setActiveUser(loginData);
		navigate('/profile');
	};
	const handleInputChange = (event) => {
		event.preventDefault();
		const target = event.target;
		setLoginData((previous) => ({ ...previous, [target.name]: [target.value] }));
	};
	return (
		<div id="Login">
			<form onSubmit={handleSubmit}>
				<label className={(attempted && 'attempted') || ''}>
					Email or username
					<input
						name="username"
						type="text"
						value={loginData.username}
						onChange={handleInputChange}
						required
					/>
				</label>
				<label className={(attempted && 'attempted') || ''}>
					Password
					<input
						name="password"
						type="password"
						value={loginData.password}
						onChange={handleInputChange}
						required
					/>
				</label>
				{attempted && <p>That username/password does not exist. Please try again</p>}
				<button type="submit">Log in</button>
			</form>
		</div>
	);
};

Login.propTypes = {
	setActiveUser: PropTypes.func.isRequired,
	activeUser: PropTypes.object,
	previousLocation: PropTypes.string,
};

export default React.memo(Login);

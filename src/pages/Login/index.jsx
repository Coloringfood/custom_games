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
const Login = ({ setActiveUser }) => {
	console.log('BBBB ----------------------------------------');
	const navigate = useNavigate();
	const [loginData, setLoginData] = useState({});

	useEffect(() => {
		console.log('BBBB Clearing user');
		setActiveUser(null);
	}, []);
	const handleSubmit = () => {
		setActiveUser(loginData);
		navigate('/profile');
	};
	const handleInputChange = (event) => {
		event.preventDefault();
		const target = event.target;
		setLoginData((previous) => ({ ...previous, [target.name]: [target.value] }));
	};
	return (
		<div id="login">
			<form onSubmit={handleSubmit}>
				<label>
					Email or username
					<input
						name="username"
						type="text"
						value={loginData.username}
						onChange={handleInputChange}
					/>
				</label>
				<label>
					Password
					<input
						name="password"
						type="password"
						value={loginData.password}
						onChange={handleInputChange}
					/>
				</label>
				<button type="submit">Log in</button>
			</form>
		</div>
	);
};

Login.propTypes = {
	setActiveUser: PropTypes.func.isRequired,
};

export default React.memo(Login);

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';

import Login from '@/pages/Login/index.jsx';
import Default from '@/pages/Default/index.jsx';
import NotFound from '@/pages/NotFound/index.jsx';
import Game from '@/pages/GameBoardDemo/index.jsx';
function About() {
	return <h2>About</h2>;
}
function Users() {
	return <h2>Users</h2>;
}

/**
 * Creates a secured Route
 * Take from https://www.robinwieruch.de/react-router-private-routes/
 *
 * @param {UserObject} user - represents the logged-in user
 * @param children - represents the component to render if user is logged in
 * @returns {*|JSX.Element}
 * @constructor
 */
const SecuredRoute = ({ user, children }) => {
	if (!user) {
		return <Navigate to="/login" />;
	}
	return children;
};
SecuredRoute.propTypes = {
	user: PropTypes.object,
	children: PropTypes.object,
};

const AppRouter = () => {
	const [user, setUser] = useState(null);

	return (
		<Router>
			<div>
				<nav>
					<ul>
						<li>
							<NavLink to="/home">Home</NavLink>
						</li>
						<li>
							<NavLink to="/about">About</NavLink>
						</li>
						{user && [
							<li key={'Secured_game'}>
								<NavLink to="/game">Game</NavLink>
							</li>,
							<li key={'Secured_profile'}>
								<NavLink to="/profile">Hello {user.username}</NavLink>
							</li>,
						]}
						<li>
							<NavLink to="/login">{user ? 'Sign Out' : 'Sign In'}</NavLink>
						</li>
					</ul>
				</nav>
				<Routes>
					<Route path="/home" element={<Default />} />
					<Route path="/about" element={<About />} />
					<Route
						path="/profile"
						element={
							<SecuredRoute user={user}>
								<Users />
							</SecuredRoute>
						}
					/>
					<Route
						path="/game"
						element={
							<SecuredRoute user={user}>
								<Game user={user} />
							</SecuredRoute>
						}
					/>
					<Route path="/login" element={<Login setActiveUser={setUser} />} />

					<Route path={'/'} element={<Navigate to={'/home'} />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>
		</Router>
	);
};

AppRouter.propTypes = {
	isStandalone: PropTypes.bool,
};

export default AppRouter;

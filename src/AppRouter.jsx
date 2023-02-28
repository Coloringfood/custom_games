import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	NavLink,
	Navigate,
	Outlet,
} from 'react-router-dom';

import Login from '@/pages/Login/index.jsx';
import Default from '@/pages/Default/index.jsx';
import NotFound from '@/pages/NotFound/index.jsx';
import GameBoardDemo from '@/pages/GameBoardDemo/index.jsx';
import GamesList from '@/pages/GameList/index.jsx';
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
							<li key={'Secured_games'}>
								<NavLink to="/games">Games</NavLink>
							</li>,
							<li key={'Secured_game_board'}>
								<NavLink to="/game_board">Game Board Demo</NavLink>
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
						path="/games"
						element={
							<SecuredRoute user={user}>
								<Outlet />
							</SecuredRoute>
						}
					>
						<Route index element={<GamesList user={user}></GamesList>} />
						<Route path="/games/seven_dragons" element={<h1>Seven Dragons</h1>} />
						<Route
							path="/games/marbles"
							element={
								<div>
									<h1>Marbles</h1>
									<Outlet />
								</div>
							}
						>
							<Route index element={<h2>Marbles List</h2>} />
							<Route path="/games/marbles/potion_explosion" element={<h2>Potion Explosion</h2>} />
							<Route path="/games/marbles/gizmos" element={<h2>Gizmos</h2>} />
						</Route>
						<Route
							path="/games/cards"
							element={
								<div>
									<h1>Cards</h1>
									<Outlet />
								</div>
							}
						>
							<Route index element={<h2>Cards List</h2>} />
							<Route path="/games/cards/5_crowns" element={<h2>5 Crowns</h2>} />
							<Route path="/games/cards/great_dalmuti" element={<h2>The Great Dalmuti</h2>} />
						</Route>
						<Route path="*" element={<NotFound />} />
					</Route>
					<Route
						path="/game_board"
						element={
							<SecuredRoute user={user}>
								<GameBoardDemo user={user} />
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

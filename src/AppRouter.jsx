import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import Test from '@/pages/Test/index.jsx';
import Default from '@/pages/Default/index.jsx';
import NotFound from '@/pages/NotFound/index.jsx';

const AppRouter = () => {
	return (
		<Router>
			<div>
				<nav>
					<ul>
						<li>
							<Link to="/">Root</Link>
						</li>
						<li>
							<Link to="/home">Home</Link>
						</li>
						<li>
							<Link to="/about">About</Link>
						</li>
						<li>
							<Link to="/users">Users</Link>
						</li>
						<li>
							<Link to="/login">Login</Link>
						</li>
						<li>
							<Link to="/ASDF">Broken</Link>
						</li>
					</ul>
				</nav>
				<Routes>
					<Route path="/home" element={<Default />} />
					<Route path="/about" element={<About />} />
					<Route path="/users" element={<Users />} />
					<Route path="/login" element={<Test />} />

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

function About() {
	return <h2>About</h2>;
}

function Users() {
	return <h2>Users</h2>;
}

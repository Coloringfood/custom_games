import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	NavLink,
	Navigate,
	Outlet,
} from 'react-router-dom';

// Pages Import
import Login from '#/pages/Login/index.jsx';
import Default from '#/pages/Default/index.jsx';
import NotFound from '#/pages/NotFound/index.jsx';
import GameBoardDemo from '#/pages/GameBoardDemo/index.jsx';
import GamesList from '#/pages/GameList/index.jsx';
import GameScorer from '#/pages/GameScorer/index.jsx';
import Maze from '#/pages/Maze/index.jsx';
import FiveCrowns from '#/pages/FiveCrowns/index.jsx';
import Maze3d from '#/pages/Maze3d/index.jsx';
import Sudoku from '#/pages/Sudoku/index.jsx';
import Test from '#/pages/Test/index.jsx';
import Cruise from '#/pages/Cruise/index.jsx';
import Quilting from '#/pages/Quilting/index.jsx';
import WhoDidItLast from '#/pages/WhoDidItLast/index.jsx';

// Styled Components
const StyledNav = styled(NavLink)`
	padding: 10px 20px;
	border-radius: 10px;

	&.active {
		background-color: ${({ theme }) => theme.palette.secondary.main};
	}
`;
function Users() {
	return <h2>Profile</h2>;
}

/**
 * Creates a secured Route
 * Take from https://www.robinwieruch.de/react-router-private-routes/
 *
 * @param {UserObject} user - represents the logged-in user
 * @param children - represents the component to render if user is logged in
 * @param setPreviousLocation - represents the function to set the previous location
 * @returns {*|JSX.Element}
 * @constructor
 */
const SecuredRoute = ({ user, children, setPreviousLocation }) => {
	// Grab current path
	const currentPath = window.location.pathname;
	// If user is not logged in, redirect to login page
	if (!user) {
		// If user is not logged in, save current path
		setPreviousLocation(currentPath);
		return <Navigate to="/login" />;
	}
	return children;
};
SecuredRoute.propTypes = {
	user: PropTypes.object,
	children: PropTypes.object,
	setPreviousLocation: PropTypes.func,
};

const AppRouter = () => {
	const [user, setUser] = useState(null);
	const [previousLocation, setPreviousLocation] = useState(null);
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<Router>
			<AppBar position="static">
				<Toolbar>
					<IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						<StyledNav to="/home">Home</StyledNav>
					</Typography>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						<StyledNav to="/scorer">Tools</StyledNav>
					</Typography>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						<StyledNav to="/who">Trackers</StyledNav>
					</Typography>
					{user && [
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }} key={'Secured_games'}>
							<StyledNav to="/games">Games</StyledNav>
						</Typography>,
						<Typography
							variant="h6"
							component="div"
							sx={{ flexGrow: 1 }}
							key={'Secured_game_board'}
						>
							<StyledNav to="/game_board">Game Board Demo</StyledNav>
						</Typography>,
					]}
					{(user && (
						<div>
							<IconButton
								size="large"
								aria-label="account of current user"
								aria-controls="menu-appbar"
								aria-haspopup="true"
								onClick={handleMenu}
								color="inherit"
							>
								<AccountCircle />
							</IconButton>
							<Menu
								id="menu-appbar"
								anchorEl={anchorEl}
								anchorOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								keepMounted
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								open={Boolean(anchorEl)}
								onClose={handleClose}
							>
								<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
									Hello {user.username}
								</Typography>
								<MenuItem onClick={handleClose}>
									<StyledNav to="/profile">Profile</StyledNav>
								</MenuItem>
								<MenuItem onClick={handleClose}>
									<StyledNav to="/login">Sign Out</StyledNav>
								</MenuItem>
							</Menu>
						</div>
					)) || (
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							<StyledNav to="/login">Sign In</StyledNav>
						</Typography>
					)}
				</Toolbar>
			</AppBar>
			<Container>
				<Routes>
					<Route path="/home" element={<Default />} />
					<Route path="/scorer" element={<GameScorer />} />
					<Route path="/test" element={<Test />} />
					<Route path="/cruise" element={<Cruise />} />
					<Route path="/quilting" element={<Quilting />} />
					<Route path="/who" element={<WhoDidItLast />} />
					<Route
						path="/profile"
						element={
							<SecuredRoute user={user} setPreviousLocation={setPreviousLocation}>
								<Users />
							</SecuredRoute>
						}
					/>
					<Route
						path="/games"
						element={
							<SecuredRoute user={user} setPreviousLocation={setPreviousLocation}>
								<Outlet />
							</SecuredRoute>
						}
					>
						<Route index element={<GamesList user={user}></GamesList>} />
						<Route path="/games/sudoku" element={<Sudoku />} />
						<Route
							path="/games/maze"
							element={
								<div>
									<h1>Maze</h1>
									<Outlet />
								</div>
							}
						>
							<Route index element={<Maze />} />
							<Route path="/games/maze/3d" element={<Maze3d />} />
						</Route>
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
							<Route path="/games/cards/5_crowns" element={<FiveCrowns />} />
							<Route path="/games/cards/great_dalmuti" element={<h2>The Great Dalmuti</h2>} />
						</Route>
						<Route path="*" element={<NotFound />} />
					</Route>
					<Route
						path="/game_board"
						element={
							<SecuredRoute user={user} setPreviousLocation={setPreviousLocation}>
								<GameBoardDemo user={user} />
							</SecuredRoute>
						}
					/>
					<Route
						path="/login"
						element={
							<Login
								setActiveUser={setUser}
								activeUser={user}
								previousLocation={previousLocation}
							/>
						}
					/>

					<Route path={'/'} element={<Navigate to={'/home'} />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Container>
		</Router>
	);
};

AppRouter.propTypes = {
	isStandalone: PropTypes.bool,
};

export default AppRouter;

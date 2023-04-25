import React from 'react';
import './GameList.css';
import { NavLink } from 'react-router-dom';

const GAMES = [
	{
		label: 'Seven Dragons',
		path: '/seven_dragons',
	},
	{
		label: 'Maze',
		path: '/maze',
		subGames: [
			{
				label: '3D Maze',
				path: '/3d',
			},
		],
	},
	{
		label: 'Sudoku',
		path: '/sudoku',
	},
	{
		label: 'Marble Games',
		path: '/marbles',
		subGames: [
			{
				label: 'Potion Explosions',
				path: '/potion_explosion',
			},
			{
				label: 'Gizmos',
				path: '/gizmos',
			},
		],
	},
	{
		label: 'Card Games',
		path: '/cards',
		subGames: [
			{
				label: '5 Crowns',
				path: '/5_crowns',
			},
			{
				label: 'The Great Dalmuti',
				path: '/great_dalmuti',
			},
		],
	},
];

function Default() {
	const renderGames = (gameArray, path) => {
		if (!Array.isArray(gameArray)) return;
		return (
			<ul>
				{gameArray.map((game, index) => {
					let subGames = [];
					let label = game.label;
					if (game.subGames) {
						subGames = renderGames(game.subGames, path + game.path);
					}
					if (game.path) {
						label = <NavLink to={path + game.path}>{label}</NavLink>;
					}

					return (
						<li key={game.label.split(' ').join('_') + '_' + index}>
							{label}
							{subGames}
						</li>
					);
				})}
			</ul>
		);
	};

	return (
		<div id="GameList">
			<p>Here are the Games I have coded so far</p>
			<div className="goals">
				<h2>Goals</h2>
				{renderGames(GAMES, '/games')}
			</div>
		</div>
	);
}

export default Default;

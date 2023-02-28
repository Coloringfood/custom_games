import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Game.css';
import PlayerBoard from '@/pages/GameBoardDemo/components/PlayerBoard.jsx';

const Game = ({ user }) => {
	const [players, setPlayers] = useState([]);
	const [activePlayer, setActivePlayer] = useState(0);
	const [transitioning, setTransitioning] = useState(true);

	useEffect(() => {
		setPlayers([{ name: user.username }, { name: 'Joe' }, { name: 'Adam' }, { name: 'Bob' }]);
		setTransitioning(false);
	}, []);

	const rotatePlay = () => {
		if (transitioning) return;
		setTransitioning(true);
		setActivePlayer((prevState) => (prevState + 1) % 4);

		setTimeout(() => setTransitioning(false), 2100);
	};

	return (
		<div id="GameGrid" onClick={rotatePlay}>
			{players.map((player, index) => (
				<PlayerBoard
					key={`Player_${index}`}
					player={player}
					activePlayer={index}
					position={(activePlayer + index) % 4}
					transitioning={transitioning}
				/>
			))}
		</div>
	);
};

Game.propTypes = {
	user: PropTypes.object.isRequired,
};

export default React.memo(Game);

import React from 'react';
import PropTypes from 'prop-types';

const PlayerBoard = ({ player, activePlayer, position, transitioning }) => {
	return (
		<div
			className={`player_board board_${position} player_${activePlayer} ${
				!transitioning && 'stopped'
			}`}
		>
			Player {activePlayer} Board
			<br />
			{player.name}
		</div>
	);
};

PlayerBoard.propTypes = {
	player: PropTypes.object,
	activePlayer: PropTypes.number,
	position: PropTypes.number,
	transitioning: PropTypes.bool,
};

export default PlayerBoard;

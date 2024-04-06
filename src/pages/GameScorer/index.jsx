import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import _ from 'lodash';
import GameModal from '#/components/GameModal.jsx';
import styled from 'styled-components';

const CustomTable = styled.table`
	margin-top: 20px;
	border: 1px solid blue;
	border-collapse: collapse;
`;
const CustomHeader = styled.th`
	border-right: 1px solid gray;
	color: ${({ active }) => (active ? 'pink' : 'green')};
	padding: 5px;
	min-width: 100px;
	max-width: 100px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
`;
const Cell = styled.td`
	border: 1px solid black;
	padding: 5px;
	background-color: ${({ active, isRound }) =>
		active ? 'pink' : isRound ? 'transparent' : 'green'};
`;

function Default() {
	const [showModal, setShowModal] = useState(false);
	// const [gameSettings, setGameSettings] = useState({ players: Players });
	const [gameSettings, setGameSettings] = useState(null);
	const [activePlayer, setActivePlayer] = useState(0);
	const [scores, setScores] = useState([[]]);
	const startNewGame = () => {
		setShowModal(true);
	};
	const onSave = (newGameSettings) => {
		setGameSettings(newGameSettings);
		setScores([[]]);
	};

	const goToNextPlayer = () => {
		let nextPlayer = activePlayer + 1;
		if (gameSettings.players.length <= nextPlayer) {
			nextPlayer = 0;
		}
		setActivePlayer(nextPlayer);
	};

	const getTotals = (scoreCard) => {
		const totals = [];

		// loop through each score, and add to the totals

		scoreCard.forEach((rowData) => {
			rowData.forEach((value, index) => {
				if (totals[index] === undefined) {
					totals[index] = value;
				} else {
					totals[index] += value;
				}
			});
		});
		return totals;
	};

	const inputEnterCheck = (ele) => {
		if (ele.code.indexOf('Enter') !== -1) {
			const scoreToAdd = parseInt(ele.target.value);
			if (isNaN(scoreToAdd)) {
				return;
			}
			const activePlayerIndex = activePlayer;
			const scoreRowIndex = scores.length - 1;
			const newScores = _.cloneDeep(scores);
			newScores[scoreRowIndex][activePlayerIndex] = scoreToAdd;

			const maxScore = _.max(getTotals(newScores));
			if (activePlayerIndex === gameSettings.players.length - 1) {
				// Max Rounds Stopping
				if (gameSettings.maxRounds && newScores.length >= gameSettings.maxRounds) {
					setScores(newScores);
					setActivePlayer(-1);
					return;
				}

				// Max Score Stopping
				if (gameSettings.maxScore && maxScore >= gameSettings.maxScore) {
					setScores(newScores);
					setActivePlayer(-1);
					return;
				}
				newScores.push([]);
			}
			setScores(newScores);
			goToNextPlayer();
		}
	};

	const renderCells = () => {
		return scores.map((round, rowIndex) => {
			return (
				<tr key={`score_row_${rowIndex}`}>
					<Cell isRound={true}>{rowIndex + 1}</Cell>
					{gameSettings.players.map((playerName, playerIndex) => (
						<Cell
							key={`${playerName}_round_${rowIndex}`}
							className={`${playerName}_round_${rowIndex}`}
							active={playerIndex === activePlayer && rowIndex === scores.length - 1}
						>
							{playerIndex === activePlayer && rowIndex === scores.length - 1 ? (
								<input
									id={`active_player_${playerIndex}`}
									type="number"
									autoFocus
									onKeyDown={inputEnterCheck}
								></input>
							) : (
								round[playerIndex]
							)}
						</Cell>
					))}
				</tr>
			);
		});
	};

	const renderTotals = () => {
		const totals = getTotals(scores);

		return gameSettings.players.map((playerName, playerIndex) => {
			return (
				<Cell key={`total_score_index_${playerIndex}`}>
					{playerName}:{totals[playerIndex]}
				</Cell>
			);
		});
	};

	return (
		<Box id="GameList">
			<GameModal onStartGame={onSave} modalOpen={showModal} setModalOpen={setShowModal} />
			<h2>Score Keeper</h2>
			<div className="goals">
				<Button onClick={startNewGame}>Start New Game</Button>
				{gameSettings && (
					<div>
						<h3>Game Name: {gameSettings.name}</h3>
						<CustomTable>
							<tr>
								<CustomHeader>Round</CustomHeader>
								{gameSettings.players.map((person, index) => (
									<CustomHeader key={`header_${index}`} active={index === activePlayer}>
										{person}
									</CustomHeader>
								))}
							</tr>
							{renderCells()}
							<tr>
								<Cell>Max Scores</Cell>
								{renderTotals()}
							</tr>
						</CustomTable>
						<p>Max Score: {gameSettings.maxScore}</p>
						<p>Max Rounds: {gameSettings.maxRounds}</p>
					</div>
				)}
			</div>
		</Box>
	);
}

export default Default;

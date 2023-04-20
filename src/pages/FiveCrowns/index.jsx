/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Button } from '@mui/material';
import styled from 'styled-components';

import { genenerateDeck } from '@/Utilities/deck.js';
import DeckCard from '@/components/DeckCard.jsx';
import GameModal from '@/components/GameModal.jsx';

import getLowestScore from '@/pages/FiveCrowns/getLowestScore';

//region Styled Components
const PlayingTable = styled.div`
	margin: 100px auto;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 900px;
	height: 700px;
	background-color: #fff;
	border-radius: 10px;
	padding: 20px;
	box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
`;
const PlayerSlot = styled.div`
	position: absolute;
	width: 700px;
	min-width: 700px;
	height: 200px;
`;
const TopPlayers = styled(PlayerSlot)`
	transform: rotate(180deg);
	top: 0;
	display: flex;
	flex-direction: row-reverse;
	align-items: center;
	justify-content: center;
`;
const LeftPlayers = styled(PlayerSlot)`
	transform: rotate(90deg);
	left: -250px;
`;
const RightPlayers = styled(PlayerSlot)`
	transform: rotate(-90deg);
	right: -250px;
	display: flex;
	flex-direction: row-reverse;
	align-items: center;
	justify-content: center;
`;
const DiscardPile = styled.div`
	margin: auto;
`;
const renderBoardLocation = (location) => {
	switch (location) {
		case 'top':
			return `
			bottom: 515px;
			transform: rotate(-180deg);	
			right: 265px;
		`;
		case 'left':
			return `
			bottom: 350px;
	    right: 0;
	    transform: rotate(-90deg);
		`;
		case 'right':
			return `
			bottom: 350px;
	    left: 0;
	    transform: rotate(90deg);
		`;
		default:
			return `
			background-color: 'blue';
		`;
	}
};
const PlayerBoard = styled.div`
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 150px;
	height: 180px;
	background-color: #fff;
	border-radius: 10px;
	padding: 10px;
	margin: 10px;
	box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
	display: inline-block;
	position: relative;

	${({ active, location }) =>
		active &&
		`
		z-index: 1;
		background-color: #f00;
		position: fixed;
		${renderBoardLocation(location)}
	`}
`;
const PlayerHand = styled.div`
	display: inline-block;
	position: relative;
`;
const CardWrapper = styled.div`
	display: inline-block;
	position: absolute;
	left: 0;
	top: 0;
	transform-origin: bottom left;
	${({ angle, selected }) => `
		transform: rotate(${angle}deg) ${selected ? 'translateY(-40px)' : ''};
		}
	`}
`;
const PlayerScore = styled.div`
	display: inline-block;
	font-size: 1em;
`;
const ScoreTable = styled.table`
	margin: 0 auto;
	border: 1px solid #000;
	border-collapse: collapse;
`;
const ScoreRow = styled.tr``;
const ScoreCell = styled.td`
	padding: 10px;
	${({ total }) =>
		total &&
		`
		font-weight: bold;
		border-top: 1px solid #000;
	`}
	${({ first }) =>
		first &&
		`
		font-weight: bold;
		background-color: rgba(0,0,0,0.1);
	`}
`;
//endregion

const sortHands = (hands, numberFirst = true) => {
	const sortOrder = numberFirst ? ['number', 'suit'] : ['suit', 'number'];
	return hands.map((hand) => {
		return _.sortBy(hand, sortOrder);
	});
};

// const renderSpreadOfCards = (cards, playerIndex, onClick) => {
// 	const angle = 15; // angle between cards in degrees
// 	const startingAngle = -angle * Math.floor(cards.length / 2); // starting angle for first card in degrees
//
// 	return cards.map((card, index) => (
// 		<CardWrapper
// 			key={`player-${playerIndex}-card-${index}`}
// 			angle={startingAngle + index * angle}
// 			selected={false}
// 		>
// 			<DeckCard onClick={onClick} size={40} {...card} />
// 		</CardWrapper>
// 	));
// };

const suits = ['hearts', 'diamonds', 'clovers', 'spades', 'stars'];
const values = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * Create a board to play 5 Crowns
 *
 * @returns {JSX.Element}
 * @constructor
 */
const FiveCrowns = () => {
	const [showModal, setShowModal] = useState(false);
	const [drawPile, setDrawPile] = useState([]);
	const [round, setRound] = useState(0);
	const [discardPile, setDiscardPile] = useState([]);
	const [playerHands, setPlayerHands] = useState([]);
	const [playerScores, setPlayerScores] = useState([]);
	const [playerNames, setPlayerNames] = useState([]);
	const [activePlayerIndex, setActivePlayerIndex] = useState(0);
	const [hasDrawn, setHasDrawn] = useState(false);
	const [playerHasFinishedIndex, setPlayerHasFinishedIndex] = useState(null);
	const [selectedCardIndex, setSelectedCardIndex] = useState(null);

	const dealCards = (newPlayerNames, newRound = round) => {
		console.log('BBBB Dealing Cards');
		const deck = _.shuffle([
			...genenerateDeck(suits, values, 3),
			...genenerateDeck(suits, values, 3),
		]);
		const hands = [];
		for (let i = 0; i < newPlayerNames.length; i++) {
			hands.push(deck.splice(0, newRound));
		}
		setHasDrawn(false);
		setSelectedCardIndex(null);
		setPlayerHasFinishedIndex(null);
		setDiscardPile([deck[0]]);
		setPlayerNames(newPlayerNames);
		setPlayerHands(sortHands(hands));
		setDrawPile(deck.splice(1));
		setActivePlayerIndex((newRound - 3) % playerNames.length);
		if (newRound !== round) {
			setRound(newRound);
		}
	};

	useEffect(() => {
		if (playerNames.length) {
			dealCards(playerNames);
		}
	}, [round]);

	useEffect(() => {
		const previousPlayerIndex =
			activePlayerIndex === 0 ? playerNames.length - 1 : activePlayerIndex - 1;
		const playerScore = getLowestScore(playerHands[previousPlayerIndex], round);
		if (playerHasFinishedIndex !== null) {
			const newPlayerScores = [...playerScores];
			newPlayerScores[round - 3][previousPlayerIndex] += playerScore.points;
			setPlayerScores(newPlayerScores);
		} else if (_.get(playerScore, 'points') === 0) {
			setPlayerHasFinishedIndex(previousPlayerIndex);
			setPlayerScores([...playerScores, playerNames.map(() => 0)]);
		}

		if (activePlayerIndex === playerHasFinishedIndex) {
			alert('Next Round');
			if (round < 14) {
				dealCards(playerNames, round + 1);
			}
		}
	}, [activePlayerIndex]);

	const handleStartGame = (gameInfo) => {
		setPlayerHands(gameInfo.players.map(() => []));
		setPlayerScores([]);
		setPlayerNames(gameInfo.players);
		setRound(3);
		setShowModal(false);
	};

	const generatePlayerBoards = () => {
		const numberOfPlayers = playerNames.length;
		const leftPlayers = [];
		const topPlayers = [];
		const rightPlayers = [];

		if (numberOfPlayers === 2) {
			leftPlayers.push(playerNames[0]);
			rightPlayers.push(playerNames[1]);
		} else {
			// Group players to left, right and top so they are in order, but separated equally
			for (let i = 0; i < numberOfPlayers; i++) {
				if (i < numberOfPlayers / 3) {
					leftPlayers.push(playerNames[i]);
				} else if (i < (numberOfPlayers / 3) * 2) {
					topPlayers.push(playerNames[i]);
				} else {
					rightPlayers.push(playerNames[i]);
				}
			}
		}

		// eslint-disable-next-line react/display-name
		const renderPlayer = (position) => (player) => {
			const playerIndex = playerNames.indexOf(player);
			const isPlayerTurn = playerIndex === activePlayerIndex;
			const onPlayerClick = (cardIndex) => () => {
				// discard top card from player hand and draw a new card.
				if (isPlayerTurn) {
					if (selectedCardIndex !== cardIndex) {
						setSelectedCardIndex(cardIndex);
						return;
					} else if (!hasDrawn) {
						return;
					}
					const newPlayerHands = [...playerHands];
					newPlayerHands[playerIndex] = [
						...newPlayerHands[playerIndex].slice(0, cardIndex),
						...newPlayerHands[playerIndex].slice(cardIndex + 1),
					];
					setSelectedCardIndex(null);
					setPlayerHands(sortHands(newPlayerHands));
					setDiscardPile([playerHands[playerIndex][cardIndex]], ...discardPile);
					setActivePlayerIndex((activePlayerIndex + 1) % playerNames.length);
					setHasDrawn(false);
				}
			};
			const renderPlayerCards = () => {
				if (isPlayerTurn) {
					const angle = 15; // angle between cards in degrees
					const startingAngle = -angle * Math.floor(playerHands[playerIndex].length / 2); // starting angle for first card in degrees

					return playerHands[playerIndex].map((card, index) => (
						<CardWrapper
							key={`player-${playerIndex}-card-${index}`}
							angle={startingAngle + index * angle}
							selected={index === selectedCardIndex}
						>
							<DeckCard
								onClick={onPlayerClick(index)}
								size={40}
								isSpecial={card.number === round || card.number === 0}
								{...card}
							/>
						</CardWrapper>
					));
				}
				return <DeckCard size={20} {...playerHands[playerIndex][0]} />;
			};
			return (
				<PlayerBoard
					id={`player-${playerIndex}`}
					active={isPlayerTurn}
					location={position}
					key={playerIndex}
					slot={playerIndex}
					totalPlayers={player.length}
				>
					<h2>{player}</h2>
					<PlayerScore>
						Hand Score: {getLowestScore(playerHands[playerIndex], round).points}
					</PlayerScore>
					<PlayerScore>Cards in Hand: {playerHands[playerIndex].length}</PlayerScore>
					<PlayerHand>Hand: {playerHands[playerIndex].length && renderPlayerCards()}</PlayerHand>
				</PlayerBoard>
			);
		};

		const drawFromPile = (isDiscard) => () => {
			if (hasDrawn) return;
			const newPlayerHands = [...playerHands];
			newPlayerHands[activePlayerIndex] = [
				...newPlayerHands[activePlayerIndex],
				isDiscard ? discardPile[0] : drawPile[0],
			];
			setPlayerHands(sortHands(newPlayerHands));
			if (isDiscard) {
				setDiscardPile(discardPile.slice(1));
			} else {
				setDrawPile(drawPile.slice(1));
			}
			setHasDrawn(true);
		};

		return (
			<PlayingTable>
				<TopPlayers>{topPlayers.map(renderPlayer('top'))}</TopPlayers>
				<LeftPlayers>{leftPlayers.map(renderPlayer('left'))}</LeftPlayers>
				<RightPlayers>{rightPlayers.map(renderPlayer('right'))}</RightPlayers>
				<DiscardPile>
					{playerHasFinishedIndex !== null && (
						<PlayerScore style={{ display: 'block' }}>
							{playerNames[playerHasFinishedIndex]} has gone out. Last Round!
						</PlayerScore>
					)}
					<PlayerScore>Wild Card is: {round}</PlayerScore>
					<br />
					<PlayerScore>Cards in Draw Pile: {drawPile.length}</PlayerScore>
					<br />
					<PlayerScore>Cards in Discard: {discardPile.length}</PlayerScore>

					<DeckCard onClick={drawFromPile(true)} size={40} {...discardPile[0]} />
					<DeckCard onClick={drawFromPile()} size={40} {...drawPile[0]} back={true} />
				</DiscardPile>
			</PlayingTable>
		);
	};

	const renderScores = () => {
		return [
			<ScoreRow key={'names'}>
				<ScoreCell />
				{playerNames.map((name, index) => {
					return (
						<ScoreCell key={`name-${index}`} first={true}>
							{name}
						</ScoreCell>
					);
				})}
			</ScoreRow>,
			...playerScores.map((round, roundIndex) => {
				return (
					<ScoreRow key={`round-${roundIndex}`}>
						<ScoreCell first={true}>{roundIndex + 1}</ScoreCell>
						{round.map((score, index) => {
							return <ScoreCell key={`${roundIndex}-score-${index}`}>{score}</ScoreCell>;
						})}
					</ScoreRow>
				);
			}),
			<ScoreRow key={'totals'}>
				<ScoreCell total={true} first={true}>
					Total
				</ScoreCell>
				{playerNames.map((name, index) => {
					return (
						<ScoreCell key={`total-${index}`} total={true}>
							{playerScores.reduce((acc, row) => acc + row[index], 0)}
						</ScoreCell>
					);
				})}
			</ScoreRow>,
		];
	};

	return (
		<div>
			<h1>Five Crowns</h1>
			<GameModal modalOpen={showModal} setModalOpen={setShowModal} onStartGame={handleStartGame} />
			<div>
				<Button onClick={() => setShowModal(true)}>Start Game</Button>
			</div>
			<ScoreTable>{renderScores()}</ScoreTable>
			{generatePlayerBoards()}
		</div>
	);
};

export default FiveCrowns;

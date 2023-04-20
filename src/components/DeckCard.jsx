import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const getSuitColor = (suit) => {
	switch (suit) {
		case 'spades':
			return '#000';
		case 'hearts':
			return '#f00';
		case 'diamonds':
			return '#f00';
		case 'clubs':
			return '#000';
		case 'stars':
			return '#bb0';
		case 'clovers':
			return '#0b0';
		default:
			return 'rgba(0,0,0,0.5)';
	}
};

const Card = styled.div`
	width: ${({ size }) => size * 2.5}px;
	height: ${({ size }) => size * 3.5}px;
	min-width: ${({ size }) => size * 2.5}px;
	min-height: ${({ size }) => size * 3.5}px;
	color: ${({ suit }) => getSuitColor(suit)};
	background-color: #fff;
	border: 1px solid #000;
	box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
	border-radius: 10px;
	position: relative;
	display: table-cell;
	vertical-align: middle;
	line-height: ${({ size }) => size / 2}px;
	${({ onClick }) => (onClick ? 'cursor: pointer;' : '')}
	${({ back }) =>
		back
			? `
		background-image: url('https://media.cnn.com/api/v1/images/stellar/prod/160927210830-tk-ah0927.jpg?q=x_370,y_0,h_1687,w_1687,c_crop');
		background-size: cover;
		background-position: center;
	`
			: ''}
	${({ isSpecial }) => (isSpecial ? 'background-color: pink;' : '')}

	& .top_text {
		position: absolute;
		top: ${({ size }) => size / 20}px;
		justify-content: space-between;
		align-items: center;
		text-align: left;
		width: 100%;
		padding: 0 ${({ size }) => size / 10}px;
	}
	& .bottom_text {
		position: absolute;
		bottom: ${({ size }) => size / 10}px;
		justify-content: space-between;
		align-items: center;
		text-align: left;
		width: 100%;
		padding: 0 ${({ size }) => size / 10}px;
		transform: rotate(180deg);
	}
	& .suit {
		margin: auto;
		font-size: ${({ size }) => size / 20}rem;
	}

	& .number {
		display: inline-block;
		font-size: ${({ size }) => size / 40}rem;
	}
`;

const DeckCard = ({ suit, number, size = 100, back, onClick, isSpecial }) => {
	if (back) {
		return <Card size={size} onClick={onClick} back={back} />;
	}
	// If card is a number under 10, return the number if it is a face card, return the face card
	const getNumber = () => {
		if (number === 0) return 'Joker';
		if (number < 10) {
			return number;
		}
		switch (number) {
			case 10:
				return 'Jack';
			case 11:
				return 'Queen';
			case 12:
				return 'King';
			case 13:
				return 'Ace';
			default:
				return '⚠';
		}
	};

	const getSuit = () => {
		switch (suit) {
			case 'clubs':
			case 'clovers':
				return '♣';
			case 'diamonds':
				return '♦';
			case 'hearts':
				return '♥';
			case 'spades':
				return '♠';
			case 'stars':
				return '★';
			case 'suns':
				return '☼';
			case 'moons':
				return '☽';
			case 'jokers':
				return '🃏';

			default:
				return '⚠';
		}
	};

	const renderNumber = () => {
		return (
			<div className="number">
				{getNumber()}
				<br />
				{getSuit()}
			</div>
		);
	};

	const onClickHandler = () => {
		if (onClick) {
			onClick();
		}
	};
	return (
		<Card size={size} suit={suit} isSpecial={isSpecial} onClick={onClickHandler}>
			<div className="top_text">{renderNumber()}</div>
			<div className="suit">{getSuit()}</div>
			<div className="bottom_text">{renderNumber()} </div>
		</Card>
	);
};

DeckCard.propTypes = {
	suit: PropTypes.number,
	number: PropTypes.number,
	size: PropTypes.number,
	onClick: PropTypes.func,
	back: PropTypes.bool,
	isSpecial: PropTypes.bool,
};

export default DeckCard;

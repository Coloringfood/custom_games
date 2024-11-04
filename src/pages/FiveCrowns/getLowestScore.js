import { uniqWith, isEqual } from 'lodash';
// Calcualte points of all cards in a hand
const calculatePoints = (hand, wildNumber) => {
	return hand.reduce((acc, card) => {
		// Jokers are worth 50 points
		if (card.number === 0) {
			return acc + 50;
		}
		// If the card is a wild card, it's worth 20 points
		if (card.number === wildNumber) {
			return acc + 20;
		}
		return acc + card.number;
	}, 0);
};

/**
 * Check if card matches cards in matching set
 * @param {[PlayingCard]} cardsToMatch
 * @param {PlayingCard} card2
 * @param {number} wildNumber
 * @returns {boolean}
 */
const areCardsMatchingNumbers = (cardsToMatch, card2, wildNumber) => {
	// get the first card that is not wild in cardsToMatch
	const card1 = cardsToMatch.reduce(
		(acc, card) => {
			if (acc.number === 0 || acc.number === wildNumber) {
				return card;
			}
			return acc;
		},
		{ number: 0 },
	);

	return (
		card1.number === card2.number ||
		card1.number === wildNumber ||
		card2.number === wildNumber ||
		card1.number === 0 ||
		card2.number === 0
	);
};

/**
 * Find all possible sets of cards that match the cardsToMatch
 * @param {[PlayingCard]} cardsToMatch
 * @param {[PlayingCard]} allOtherCards
 * @param {number} wildNumber
 * @returns {[PlayingCard[]]}
 */
const findAllPossibleSets = (cardsToMatch = [], allOtherCards, wildNumber) => {
	if (allOtherCards.length === 0) {
		return [];
	}
	const possibleOtherMatchingSets = [];
	for (let i = 0; i < allOtherCards.length; i++) {
		const nextCard = allOtherCards[i];
		if (cardsToMatch.length && !areCardsMatchingNumbers(cardsToMatch, nextCard, wildNumber)) {
			continue;
		}
		const newStart = cardsToMatch.concat(nextCard);
		if (newStart.length >= 3) {
			possibleOtherMatchingSets.push(newStart);
		}
		const otherMatches = findAllPossibleSets(newStart, allOtherCards.slice(i + 1), wildNumber);
		if (otherMatches.length > 0) {
			possibleOtherMatchingSets.push(...otherMatches);
		}
	}
	return uniqWith(possibleOtherMatchingSets, isEqual);
};

/**
 * Check if card is the next card in the run
 * @param {[PlayingCard]} cardsInRun - Already sorted in order of run from lowest to highest
 * @param {PlayingCard} card
 * @param {number} wildNumber
 * @returns {boolean}
 */
const isCardInRun = (cardsInRun, card, wildNumber) => {
	const lastCardInRun = cardsInRun.reduce(
		(previousCard, card) => {
			let { suit, number } = card;
			// if current number is a wild/joker number, use the numbers of the previous card
			if (number === wildNumber || number === 0) {
				suit = previousCard.suit;
				if (previousCard.number !== 0 && previousCard.number !== wildNumber) {
					number = previousCard.number + 1;
				} else {
					number = 0;
				}
			}

			return {
				number,
				suit,
			};
		},
		{ suit: 'jokers', number: 0 },
	);

	return (
		card.number === wildNumber || // is a wild card
		card.number === 0 || // is a joker
		// is the next card in the run for suit
		(card.number === lastCardInRun.number + 1 && card.suit === lastCardInRun.suit) ||
		// lastCardInRun was a wild/joker
		lastCardInRun.number === 0
	);
};

/**
 * Find all possible runs of cards that match the cards in current Run
 * @param {[PlayingCard]} cardsInCurrentRun
 * @param {[PlayingCard]} otherCards
 * @param {number} wildNumber
 * @returns {[PlayingCard[]]}
 */
const findAllPossibleRuns = (cardsInCurrentRun = [], otherCards, wildNumber) => {
	if (otherCards.length === 0) {
		return [];
	}
	const possibleOtherMatchingSets = [];
	for (let i = 0; i < otherCards.length; i++) {
		const nextCard = otherCards[i];

		// if nothing is in cardsInrun, or nextCard is the next card in the run, add it to the run
		const inRun = isCardInRun(cardsInCurrentRun, nextCard, wildNumber);
		if (cardsInCurrentRun.length === 0 || inRun) {
			const newRun = cardsInCurrentRun.concat(nextCard);
			if (newRun.length >= 3) {
				possibleOtherMatchingSets.push([...cardsInCurrentRun, nextCard]);
			}
			const otherMatches = findAllPossibleRuns(
				newRun,
				otherCards.slice(0, i).concat(otherCards.slice(i + 1)),
				wildNumber,
			);
			if (otherMatches.length > 0) {
				possibleOtherMatchingSets.push(...otherMatches);
			}
		}
	}
	return uniqWith(possibleOtherMatchingSets, isEqual);
};

const takeOutCardsFromHand = (hand, cardsToTakeOut) => {
	const [cardsLeft, remainingCards] = hand.reduce(
		([cardsLeftToTake, remainingCards], card) => {
			if (cardsLeftToTake.length === 0) {
				return [[], remainingCards.concat(card)];
			}
			const index = cardsLeftToTake.findIndex((cardToTake) => {
				return cardToTake.suit === card.suit && cardToTake.number === card.number;
			});
			if (index === -1) {
				return [cardsLeftToTake, remainingCards.concat(card)];
			}
			return [
				cardsLeftToTake.slice(0, index).concat(cardsLeftToTake.slice(index + 1)),
				remainingCards,
			];
		},
		[[...cardsToTakeOut], []],
	);
	return [cardsLeft.length === 0, remainingCards];
};

// Define a recursive function to find the lowest possible outcome using all the cards in the hand in groupings of runs or sets
const getLowestScore = (hand, wildNumber) => {
	if (!hand) {
		return {
			points: 99999,
			groupings: [],
			leftOverCards: [],
		};
	}
	if (hand.length < 3) {
		return calculatePoints(hand, wildNumber);
	}

	const allPossibleSets = findAllPossibleSets([], hand, wildNumber);
	const allPossibleRuns = findAllPossibleRuns([], hand, wildNumber);
	const allPossibilities = allPossibleSets.concat(allPossibleRuns);

	if (allPossibilities.length === 0) {
		return {
			points: calculatePoints(hand, wildNumber),
			groupings: [],
			leftOverCards: hand,
		};
	}

	// Go through the hand, and try every combination that keeps the lowest score

	const checkForLowestScore = (cardSets, cardsLeft) => {
		let lowestPoints = calculatePoints(cardsLeft, wildNumber),
			lowestGroupings = cardSets,
			lowestLeftOverCards = cardsLeft;
		if (cardsLeft.length === 0) {
			lowestPoints = 0;
			lowestGroupings = cardSets;
			lowestLeftOverCards = [];
		} else if (cardsLeft.length < 3) {
			lowestPoints = calculatePoints(cardsLeft, wildNumber);
			lowestGroupings = cardSets;
			lowestLeftOverCards = cardsLeft;
		} else {
			// Take out each possible option and recursively check the rest of the hand
			allPossibilities.forEach((possibleSet) => {
				if (lowestPoints === 0) return;
				const [allCardsUsed, newCardsLeft] = takeOutCardsFromHand(cardsLeft, possibleSet);
				if (!allCardsUsed) {
					return;
				}
				const { points, groupings, leftOverCards } = checkForLowestScore(
					cardSets.concat([possibleSet]),
					newCardsLeft,
				);
				if (lowestPoints === undefined || points < lowestPoints) {
					lowestPoints = points;
					lowestGroupings = groupings;
					lowestLeftOverCards = leftOverCards;
				}
			});
		}
		return {
			points: lowestPoints,
			groupings: lowestGroupings,
			leftOverCards: lowestLeftOverCards,
		};
	};

	return checkForLowestScore([], hand);
};

export default getLowestScore;

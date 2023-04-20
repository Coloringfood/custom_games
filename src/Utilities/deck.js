import _ from 'lodash';
const defaultSuits = ['hearts', 'spades', 'clubs', 'diamonds'];
const defaultValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
/**
 * @typedef {Object} PlayingCard
 * @property {number} number
 * @property {string} suit
 */

/**
 * Generate a deck of cards
 * @param suits
 * @param values
 * @param numberOfJokers
 * @returns {PlayingCard[]}
 */
const genenerateDeck = (suits = defaultSuits, values = defaultValues, numberOfJokers) => {
	const deck = [];

	for (let value of values) {
		for (let suit of suits) {
			deck.push({
				number: value,
				suit,
			});
		}
	}

	if (numberOfJokers) {
		for (let i = 0; i < numberOfJokers; i++) {
			deck.push({
				number: 0,
				suit: 'jokers',
			});
		}
	}

	return _.shuffle(deck);
};

export { genenerateDeck };

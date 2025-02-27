import { shuffle } from 'lodash';
const suits = ['hearts', 'spades', 'clubs', 'diamonds', 'stars', 'suns', 'moons', 'clovers'];
const defaultSuits = suits.slice(0, 4);
const defaultValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
/**
 * @typedef {Object} PlayingCard
 * @property {number} number
 * @property {string} suit
 */

/**
 * Generate a deck of cards
 * @example genenerateDeck(['hearts', 'spades', 'clubs', 'diamonds'], [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 2)
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

	return shuffle(deck);
};

export { genenerateDeck, suits };

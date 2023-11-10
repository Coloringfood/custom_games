import _ from 'lodash';

const solution = [
	[5, 3, 4, 6, 7, 8, 9, 1, 2],
	[6, 7, 2, 1, 9, 5, 3, 4, 8],
	[1, 9, 8, 3, 4, 2, 5, 6, 7],
	[8, 5, 9, 7, 6, 1, 4, 2, 3],
	[4, 2, 6, 8, 5, 3, 7, 9, 1],
	[7, 1, 3, 9, 2, 4, 8, 5, 6],
	[9, 6, 1, 5, 3, 7, 2, 8, 4],
	[2, 8, 7, 4, 1, 9, 6, 3, 5],
	[3, 4, 5, 2, 8, 6, 1, 7, 9],
];
const starting = [
	[5, 3, 0, 0, 7, 0, 0, 0, 0],
	[6, 0, 0, 1, 9, 5, 0, 0, 0],
	[0, 9, 8, 0, 0, 0, 0, 6, 0],
	[8, 0, 0, 0, 6, 0, 0, 0, 3],
	[4, 0, 0, 8, 0, 3, 0, 0, 1],
	[7, 0, 0, 0, 2, 0, 0, 0, 6],
	[0, 6, 0, 0, 0, 0, 2, 8, 0],
	[0, 0, 0, 4, 1, 9, 0, 0, 5],
	[0, 0, 0, 0, 8, 0, 0, 7, 9],
];
const createGenericPuzzle = () => [starting, solution];

const displayPuzzle = (puzzle) => {
	const message = puzzle.map((row) => row.join(' ')).join('\n');
	console.log(message);
};

const DIFFICULTY_LEVEL_MAP = {
	easy: 40,
	medium: 50,
	hard: 60,
};

/**
 * Create a sudoku puzzle
 * @param {('easy'|'medium'|'hard')} difficulty
 * @returns {[*,(*|number|boolean)]}
 */
export const createSudokuPuzzle = async (difficulty) => {
	let solvedPuzzle = [];
	console.log('BBBB difficulty: ', difficulty);

	// fill out empty puzzles
	for (let i = 0; i < 9; i++) {
		const row = [];
		for (let j = 0; j < 9; j++) {
			row.push(0);
		}
		solvedPuzzle.push(row);
	}

	// Create solvedPuzzle
	const numberAlreadyInRow = (rowIndex, number, puzzle) => {
		for (let i = 0; i < 9; i++) {
			if (puzzle[rowIndex][i] === number) return true;
		}
		return false;
	};
	const numberAlreadyInColumn = (columnIndex, number, puzzle) => {
		for (let i = 0; i < 9; i++) {
			if (puzzle[i][columnIndex] === number) return true;
		}
		return false;
	};
	const numberAlreadyInSquare = (rowIndex, columnIndex, number, puzzle) => {
		const squareStartingRowIndex = Math.floor(rowIndex / 3) * 3;
		const squareStartingColumnIndex = Math.floor(columnIndex / 3) * 3;
		for (let i = squareStartingRowIndex; i < squareStartingRowIndex + 3; i++) {
			for (let j = squareStartingColumnIndex; j < squareStartingColumnIndex + 3; j++) {
				if (puzzle[i][j] === number) return true;
			}
		}
		return false;
	};
	const createSolvedPuzzle = (currentNumber, slotsLeft, puzzle, previousSlotsTried = []) => {
		if (currentNumber === 10) return puzzle;
		if (slotsLeft === 0) {
			console.log('BBBB finished: ', currentNumber);
			const newPuzzle = _.cloneDeep(puzzle);
			const nextPuzzle = createSolvedPuzzle(currentNumber + 1, 9, newPuzzle);
			if (nextPuzzle) return nextPuzzle;
			return 0;
		}
		const rows = _.shuffle(_.range(9));
		const columns = _.shuffle(_.range(9));
		const currentTriedSlots = [...previousSlotsTried];
		for (let i = 0; i < 9; i++) {
			const row = rows[i];
			for (let j = 0; j < 9; j++) {
				const slot = [row, columns[j]];
				if (previousSlotsTried.some((previousSlot) => _.isEqual(previousSlot, slot))) continue;
				currentTriedSlots.push(slot);
				const column = columns[j];
				if (puzzle[row][column] !== 0) continue; // skip filled slots
				if (numberAlreadyInRow(row, currentNumber, puzzle)) continue; // check row
				if (numberAlreadyInColumn(column, currentNumber, puzzle)) continue; // check column
				if (numberAlreadyInSquare(row, column, currentNumber, puzzle)) continue; // check square
				puzzle[row][column] = currentNumber; // if all checks pass, set number
				const newPuzzle = _.cloneDeep(puzzle); // clone puzzle
				const nextPuzzle = createSolvedPuzzle(
					currentNumber,
					slotsLeft - 1,
					newPuzzle,
					currentTriedSlots,
				); // recurse
				if (nextPuzzle) return nextPuzzle; // if solution found, return it
				puzzle[row][column] = 0; // if solution not found, reset slot
			}
		}
		return false;
	};
	/*const createSolvedPuzzle = async (currentNumber, slotsLeft, puzzle, previousSlotsTried = []) => {
		if (currentNumber === 10) return puzzle;
		if (slotsLeft === 0) {
			console.log('BBBB finished: ', currentNumber);
			const newPuzzle = _.cloneDeep(puzzle);
			const nextPuzzle = createSolvedPuzzle(currentNumber + 1, 9, newPuzzle);
			if (nextPuzzle) return nextPuzzle;
			return 0;
		}
		let resolvePromise;
		const returnPromise = new Promise((resolve) => {
			resolvePromise = resolve;
		});
		const allChildrePromises = [];
		const rows = _.shuffle(_.range(9));
		const columns = _.shuffle(_.range(9));
		const currentTriedSlots = [...previousSlotsTried];
		for (let i = 0; i < 9; i++) {
			const row = rows[i];
			for (let j = 0; j < 9; j++) {
				const slot = [row, columns[j]];
				if (previousSlotsTried.some((previousSlot) => _.isEqual(previousSlot, slot))) continue;
				currentTriedSlots.push(slot);
				const column = columns[j];
				if (puzzle[row][column] !== 0) continue; // skip filled slots
				if (numberAlreadyInRow(row, currentNumber, puzzle)) continue; // check row
				if (numberAlreadyInColumn(column, currentNumber, puzzle)) continue; // check column
				if (numberAlreadyInSquare(row, column, currentNumber, puzzle)) continue; // check square
				puzzle[row][column] = currentNumber; // if all checks pass, set number
				const newPuzzle = _.cloneDeep(puzzle); // clone puzzle
				const nextPuzzle = createSolvedPuzzle(
					currentNumber,
					slotsLeft - 1,
					newPuzzle,
					currentTriedSlots,
				); // recurse
				allChildrePromises.push(nextPuzzle);
				nextPuzzle.then((value) => {
					if (value) {
						console.log('BBBB Found solution: ', displayPuzzle(value), currentNumber);
						resolvePromise(value);
					} // if solution found, return it
				});
				puzzle[row][column] = 0; // reset slot for next loop
			}
		}
		Promise.all(allChildrePromises).then(() => {
			resolvePromise(false);
		});
		return returnPromise;
	};*/

	solvedPuzzle = createSolvedPuzzle(1, 9, solvedPuzzle);
	const startingPuzzle = _.cloneDeep(solvedPuzzle);

	const findAllPuzzleSolutions = (currentNumber, numbersLeft, puzzle, emptySlots) => {
		if (numbersLeft.length === 0) return [puzzle];
		const solutions = [];
		emptySlots.forEach((slot, index) => {
			const { row, column } = slot;
			if (puzzle[row][column] !== 0) return; // skip filled slots
			if (numberAlreadyInRow(row, currentNumber, puzzle)) return; // check row
			if (numberAlreadyInColumn(column, currentNumber, puzzle)) return; // check column
			if (numberAlreadyInSquare(row, column, currentNumber, puzzle)) return; // check square
			puzzle[row][column] = currentNumber; // if all checks pass, set number
			const newPuzzle = _.cloneDeep(puzzle); // clone puzzle
			const nextPuzzle = findAllPuzzleSolutions(
				numbersLeft[0],
				numbersLeft.slice(1),
				newPuzzle,
				emptySlots.slice(0, index).concat(emptySlots.slice(index + 1)),
			); // recurse
			solutions.push(...nextPuzzle);
			puzzle[row][column] = 0; // reset slot for next loop
		});
		return _.uniqWith(solutions, _.isEqual);
	};
	// Create startingPuzzle from solvedPuzzle based on difficulty
	const hasOneSolution = (puzzle, missingNumbers, emptySlots) => {
		const newPuzzle = _.cloneDeep(puzzle);
		const solutions = findAllPuzzleSolutions(
			missingNumbers[0],
			missingNumbers.splice(1),
			newPuzzle,
			emptySlots,
		);
		console.log('BBBB solutions: ', solutions);
		return solutions.length === 1;
	};
	const removedNumbers = [];
	const emptySlots = [];
	for (let i = 0; i < (DIFFICULTY_LEVEL_MAP[difficulty] || 4); i++) {
		let unique = false;
		let attempts = 0;
		do {
			// TODO, don't do random. Do a more intelligent way of removing numbers
			const row = _.random(8);
			const column = _.random(8);
			const currentNumber = startingPuzzle[row][column];
			if (currentNumber === 0) continue;
			const newPuzzle = _.cloneDeep(startingPuzzle);
			newPuzzle[row][column] = 0;
			if (
				hasOneSolution(
					newPuzzle,
					[...removedNumbers, currentNumber],
					[...emptySlots, { row, column }],
				)
			) {
				unique = true;
				removedNumbers.push(currentNumber);
				emptySlots.push({ row, column });
				startingPuzzle[row][column] = 0;
				break;
			}
		} while (attempts++ < 10);
		if (!unique) throw new Error('Could not create a unique puzzle');
	}

	displayPuzzle(startingPuzzle);
	displayPuzzle(solvedPuzzle);
	return [startingPuzzle, solvedPuzzle];
};

export default createGenericPuzzle;

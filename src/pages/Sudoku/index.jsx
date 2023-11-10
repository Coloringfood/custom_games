import React, { useState, useEffect, useCallback } from 'react';
import styledC from 'styled-components';
import _ from 'lodash';
import { Button } from '@mui/material';
import createPuzzle, { createSudokuPuzzle } from './createSudokuPuzzle.js';

const GIVEN = 'given';
const CORRECT = 'correct';
const EMPTY = 'empty';
const INCORRECT = 'incorrect';
const EMPTY_VALUE = 0;

const SudokuWrapper = styledC.div`
	margin: 40px auto;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const SudokuTable = styledC.table`
	border-collapse: collapse;
	border: 3px solid black;
	
	& tr:nth-child(3n) td {
		border-bottom: 3px solid black;
	}
	& tr td:nth-child(3n) {
		border-right: 3px solid black;
	}
`;
const SudokuCell = styledC.td`
  width: 50px;
  height: 50px;
  border: 1px solid black;
  text-align: center;
  font-size: 30px;
  cursor: pointer;
  ${(props) => {
		switch (props.type) {
			case GIVEN:
				return 'background-color: blue;';
			case CORRECT:
				return 'background-color: green;';
			case INCORRECT:
				return 'background-color: red;';
			default:
				return '';
		}
	}}
`;
const NumberSelector = styledC.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
`;
const NumberButton = styledC.button`
	width: 50px;
	height: 50px;
	font-size: 30px;
	${({ active }) => (active ? 'background-color: green;' : '')}
`;

const Sudoku = () => {
	const [sudokuTable, setSudokuTable] = useState([]);
	const [startingTable, setStartingTable] = useState([]);
	const [sudokuSolution, setSudokuSolution] = useState([]);
	const [activeNumber, setActiveNumber] = useState(1);
	const [showSolution, setShowSolution] = useState(true);

	const getCellType = (rowIndex, cellIndex, value) => {
		if (!value) value = sudokuTable[rowIndex][cellIndex];
		if (value === EMPTY_VALUE) return EMPTY;
		if (startingTable[rowIndex][cellIndex] !== EMPTY_VALUE) return GIVEN;
		if (showSolution && sudokuSolution[rowIndex][cellIndex] === value) return CORRECT;
		// check rest of row, column, or square for same number
		// if duplicate found, return incorrect
		// else return empty
		// check row
		for (let i = 0; i < 9; i++) {
			if (i !== cellIndex && sudokuTable[rowIndex][i] === value) return INCORRECT;
		}
		// check column
		for (let i = 0; i < 9; i++) {
			if (i !== rowIndex && sudokuTable[i][cellIndex] === value) return INCORRECT;
		}
		// check square
		const squareRow = Math.floor(rowIndex / 3) * 3;
		const squareCol = Math.floor(cellIndex / 3) * 3;
		for (let i = squareRow; i < squareRow + 3; i++) {
			for (let j = squareCol; j < squareCol + 3; j++) {
				if (i !== rowIndex && j !== cellIndex && sudokuTable[i][j] === value) return INCORRECT;
			}
		}

		return EMPTY;
	};

	useEffect(() => {
		const [starting, solution] = createPuzzle(1);
		setSudokuTable(_.cloneDeep(starting));
		setStartingTable(starting);
		setSudokuSolution(solution);
	}, []);

	const toggleActiveNumber = useCallback((number) => {
		setActiveNumber((previousNumber) => {
			if (previousNumber === number) return null;
			return number;
		});
	}, []);
	const setCell = (e) => {
		const { cell, row } = e.target.dataset;

		if (startingTable[row][cell] !== EMPTY_VALUE) return;
		const newTable = _.cloneDeep(sudokuTable);
		newTable[row][cell] = activeNumber;
		setSudokuTable(newTable);
	};

	const isNumberFinished = useCallback(
		(number) => {
			const numberCount = _.flatten(sudokuTable).filter((cell) => cell === number).length;
			return numberCount === 9;
		},
		[sudokuTable],
	);

	const renderSudokuTable = useCallback(() => {
		return (
			<SudokuTable>
				<tbody>
					{sudokuTable.map((row, rowIndex) => {
						return (
							<tr key={`row_${rowIndex}`}>
								{row.map((cell, cellIndex) => {
									const cellType = getCellType(rowIndex, cellIndex, cell);
									let body = cell;
									if (body === EMPTY_VALUE) body = '';
									return (
										<SudokuCell
											type={cellType}
											key={`cell_${rowIndex}_${cellIndex}`}
											onClick={setCell}
											data-cell={cellIndex}
											data-row={rowIndex}
										>
											{body}
										</SudokuCell>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</SudokuTable>
		);
	}, [sudokuTable, activeNumber, showSolution]);

	const testCode = async () => {
		console.log('BBBB --------------------');
		const [newStartingPuzzle, newSolvedPuzzle] = await createSudokuPuzzle('');
		setStartingTable(newStartingPuzzle);
		setSudokuSolution(newSolvedPuzzle);
		setSudokuTable(_.cloneDeep(newStartingPuzzle));
	};
	return (
		<div>
			<Button onClick={testCode}>Test Code</Button>
			<Button onClick={() => setShowSolution((previous) => !previous)}>
				{showSolution ? 'Hide Got Solution' : 'Show Got Solution'}
			</Button>
			<SudokuWrapper>{renderSudokuTable()}</SudokuWrapper>

			<NumberSelector>
				{[EMPTY_VALUE, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => {
					return (
						<NumberButton
							active={activeNumber === number}
							disabled={isNumberFinished(number)}
							key={`number_${number}`}
							onClick={() => {
								toggleActiveNumber(number);
							}}
						>
							{number || 'X'}
						</NumberButton>
					);
				})}
			</NumberSelector>
		</div>
	);
};

export default Sudoku;

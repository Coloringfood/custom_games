import React, { useState, useEffect, useCallback } from 'react';
import styledC from 'styled-components';

import generateMaze from '@/pages/Maze/generateMaze.js';
import traverseMaze from '@/pages/Maze/traverseMaze.js';

const MazeWrapper = styledC.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const MazeCell = styledC.td`
  width: 50px;
  height: 50px;
  background-color: ${({ start, end, solution }) => {
		if (start) {
			return '#0f0';
		}
		if (end) {
			return '#f00';
		}
		if (solution) {
			return `rgba(0, 200, 200, 0.${Math.floor(60 * solution + 10)})`;
		}
	}};
  border-top: 1px solid ${(props) => (props.north ? '#000' : '#fff')};
  border-bottom: 1px solid ${(props) => (props.south ? '#000' : '#fff')};
  border-left: 1px solid ${(props) => (props.west ? '#000' : '#fff')};
  border-right: 1px solid ${(props) => (props.east ? '#000' : '#fff')};
  
  & .coords {
    font-size: 10px;
    color: orange;
    display: block;
	}
`;

const useKeyPress = function (targetKey) {
	const [keyPressed, setKeyPressed] = useState(false);

	React.useEffect(() => {
		const downHandler = ({ key }) => {
			if (key === targetKey) {
				setKeyPressed(true);
			}
		};

		const upHandler = ({ key }) => {
			if (key === targetKey) {
				setKeyPressed(false);
			}
		};

		window.addEventListener('keydown', downHandler);
		window.addEventListener('keyup', upHandler);

		return () => {
			window.removeEventListener('keydown', downHandler);
			window.removeEventListener('keyup', upHandler);
		};
	}, [targetKey]);

	return keyPressed;
};

const Maze = () => {
	const [maze, setMaze] = useState([]);
	const [height, setHeight] = useState(10);
	const [width, setWidth] = useState(10);
	const [person, setPerson] = useState({ x: 0, y: 0 });
	const [path, setPath] = useState([]);

	useEffect(() => {
		if (!maze.length) return;
		// check if person is at the end
		if (person.x === maze[0].length - 1 && person.y === maze.length - 1) {
			setTimeout(() => alert('You win!'), 1);
		}
	}, [person]);

	const upPressed = useKeyPress('ArrowUp');
	const downPressed = useKeyPress('ArrowDown');
	const leftPressed = useKeyPress('ArrowLeft');
	const rightPressed = useKeyPress('ArrowRight');

	const movePerson = useCallback((moveX, moveY) => {
		// check if allowed to move the indicated direction
		const { north, south, east, west } = maze[person.y][person.x];
		if (moveX === 1 && east) return;
		if (moveX === -1 && west) return;
		if (moveY === 1 && south) return;
		if (moveY === -1 && north) return;
		// if allowed to move, move
		setPerson((prevPerson) => ({
			x: prevPerson.x + moveX,
			y: prevPerson.y + moveY,
		}));
	});

	useEffect(() => {
		if (upPressed) movePerson(0, -1);
	}, [upPressed]);
	useEffect(() => {
		if (downPressed) movePerson(0, 1);
	}, [downPressed]);
	useEffect(() => {
		if (leftPressed) movePerson(-1, 0);
	}, [leftPressed]);
	useEffect(() => {
		if (rightPressed) movePerson(1, 0);
	}, [rightPressed]);

	useEffect(() => {
		if (!height || !width) return;
		const maze = generateMaze(height, width);
		setMaze(maze);
		setPath(traverseMaze(maze));
		setPerson({ x: 0, y: 0 });
	}, [height, width]);

	return (
		<div>
			<div style={{ margin: 20, padding: 10 }}>
				<h3>Select Maze Size</h3>
				<input type={'number'} value={height} onChange={(e) => setHeight(e.target.value)} />
				<input type={'number'} value={width} onChange={(e) => setWidth(e.target.value)} />
			</div>
			<div>
				<h3>Instructions</h3>
				<p>Use the arrow keys to move the person through the maze.</p>
				<p>Green represents the start and Red represents the destination</p>
				<p>
					Yellow represents the solution path for people coding a solution in the traverseMaze.js
				</p>
				<p>Start in the top left corner, and try to get to the bottom right</p>
			</div>
			<MazeWrapper>
				<table>
					<tbody>
						{maze.map((row, i) => (
							<tr key={i}>
								{row.map((cell, j) => {
									const indexInPath = path.indexOf(`${j},${i}`);
									return (
										<MazeCell
											key={j}
											{...cell}
											start={i === 0 && j === 0}
											end={i === maze.length - 1 && maze.length && j === maze[0].length - 1}
											solution={indexInPath !== -1 && indexInPath / path.length}
										>
											<span className="coords">
												{i},{j}
											</span>
											{person.x === j && person.y === i && '👨'}
										</MazeCell>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</MazeWrapper>
		</div>
	);
};

export default Maze;

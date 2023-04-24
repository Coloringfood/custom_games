import React, { useState, useEffect, useCallback } from 'react';
import styledC from 'styled-components';

import generateMaze3D from '@/pages/Maze3d/generateMaze3D.js';
import traverseMaze3D from '@/pages/Maze3d/traverseMaze3D.js';

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
			return 'rgba(0, 200, 200, 0.5)';
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
	const [depth, setDepth] = useState(10);
	const [person, setPerson] = useState({ x: 0, y: 0, z: 0 });
	const [path, setPath] = useState([]);

	// Check if person is at end of maze
	useEffect(() => {
		if (!maze.length) return;
		// check if person is at the end
		if (
			person.x === maze[0].length - 1 &&
			person.y === maze.length - 1 &&
			person.z === maze[0][0].length - 1
		) {
			setTimeout(() => alert('You win!'), 1);
		}
	}, [person]);

	const upPressed = useKeyPress('ArrowUp');
	const downPressed = useKeyPress('ArrowDown');
	const leftPressed = useKeyPress('ArrowLeft');
	const rightPressed = useKeyPress('ArrowRight');
	const spacePressed = useKeyPress(' ');
	const shiftPressed = useKeyPress('Shift');

	const movePerson = useCallback((moveX, moveY, moveZ = 0) => {
		// check if allowed to move the indicated direction
		const { north, south, east, west, up, down } = maze[person.y][person.x][person.z];
		if (moveX === 1 && east) return;
		if (moveX === -1 && west) return;
		if (moveY === 1 && south) return;
		if (moveY === -1 && north) return;
		if (moveZ === 1 && up) return;
		if (moveZ === -1 && down) return;
		// if allowed to move, move
		setPerson((prevPerson) => ({
			x: prevPerson.x + moveX,
			y: prevPerson.y + moveY,
			z: prevPerson.z + moveZ,
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
		if (spacePressed) movePerson(0, 0, 1);
	}, [spacePressed]);
	useEffect(() => {
		if (shiftPressed) movePerson(0, 0, -1);
	}, [shiftPressed]);

	useEffect(() => {
		if (!height || !width || !depth) return;
		const maze = generateMaze3D(height, width, depth);
		setMaze(maze);
		setPath(traverseMaze3D(maze));
		setPerson({ x: 0, y: 0, z: 0 });
	}, [height, width]);

	const renderMazeFloor = () => {
		return maze.map((row, i) => (
			<tr key={i}>
				{row.map((cell, j) => (
					<MazeCell
						key={j}
						{...cell[person.z]}
						start={i === 0 && j === 0 && person.z === 0}
						end={
							i === maze.length - 1 &&
							maze.length &&
							j === maze[0].length - 1 &&
							person.z === maze[0][0].length - 1
						}
						solution={path.includes(`${j},${i},${person.z}`)}
					>
						<span className="coords">
							{i},{j},{person.z}
						</span>
						{!cell[person.z].up && <span className="up">⬆️</span>}
						{!cell[person.z].down && <span className="up">⬇️</span>}
						{person.x === j && person.y === i && '👨'}
					</MazeCell>
				))}
			</tr>
		));
	};

	return (
		<div>
			<div style={{ margin: 20, padding: 10 }}>
				<h3>Select Maze Size</h3>
				<input type={'number'} value={height} onChange={(e) => setHeight(e.target.value)} />
				<input type={'number'} value={width} onChange={(e) => setWidth(e.target.value)} />
				<input type={'number'} value={depth} onChange={(e) => setDepth(e.target.value)} />
			</div>
			<div>Floor: {person.z}</div>
			<MazeWrapper>
				<table>
					<tbody>{renderMazeFloor()}</tbody>
				</table>
				{/*{(maze.length && maze[0].length && maze[0][0].length && (*/}
				{/*	<ThreeDMaze maze={maze} person={person} path={path} />*/}
				{/*)) || <div>Loading...</div>}*/}
			</MazeWrapper>
		</div>
	);
};

export default Maze;

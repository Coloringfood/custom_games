// take a maze and return a path through it

/**
 *
 * @param {[[{north: boolean, south: boolean, east: boolean, west: boolean}]]} maze A 2D array of cells
 * @returns {string[]} An array of coordinates that represent a path through the maze
 */
export default function traverseMaze(maze) {
	const end = `${maze[0].length - 1},${maze.length - 1}`;
	console.log('BBBB ---------2D-----------');

	//TODO: traverse the maze and return a path through it
	const traverseMaze = (x, y, previousLocations = []) => {
		const currentLocation = `${x},${y}`;
		const { north: northWall, south: southWall, east: eastWall, west: westWall } = maze[y][x];
		if (currentLocation === end) {
			console.log('Made it to the end of the maze!');
			return previousLocations;
		}
		console.log(`BBBB currentLocation ${currentLocation}: previousLocations: ${previousLocations}`);
		console.log(
			`BBBB northWall: ${northWall}, southWall: ${southWall}, eastWall: ${eastWall}, westWall: ${westWall}`,
		);

		if (!northWall && !previousLocations.includes(`${x},${y - 1}`)) {
			const path = traverseMaze(x, y - 1, [...previousLocations, currentLocation]);
			if (path.length > 0) {
				return [currentLocation, ...path];
			}
		}
		if (!southWall && !previousLocations.includes(`${x},${y + 1}`)) {
			const path = traverseMaze(x, y + 1, [...previousLocations, currentLocation]);
			if (path.length > 0) {
				return [currentLocation, ...path];
			}
		}
		if (!eastWall && !previousLocations.includes(`${x + 1},${y}`)) {
			const path = traverseMaze(x + 1, y, [...previousLocations, currentLocation]);
			if (path.length > 0) {
				return [currentLocation, ...path];
			}
		}
		if (!westWall && !previousLocations.includes(`${x - 1},${y}`)) {
			const path = traverseMaze(x - 1, y, [...previousLocations, currentLocation]);
			if (path.length > 0) {
				return [currentLocation, ...path];
			}
		}

		return [];
	};
	const path = traverseMaze(0, 0, []);

	// Example return array = ['0,0', '0,1', '1,1'] = ['x,y', 'x,y', 'x,y']
	return path;
}

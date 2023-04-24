// take a maze and return a path through it

/**
 *
 * @param {[[{north: boolean, south: boolean, east: boolean, west: boolean}]]} maze A 2D array of cells
 * @returns {string[]} An array of coordinates that represent a path through the maze
 */
export default function traverseMaze3D(maze) {
	const end = `${maze[0].length - 1},${maze.length - 1},${maze[0][0].length - 1}`;
	console.log('BBBB ---------3D-----------');

	//TODO: traverse the maze and return a path through it
	const traverseMaze = (x, y, z, previousLocations = []) => {
		const currentLocation = `${x},${y},${z}`;
		const {
			north: northWall,
			south: southWall,
			east: eastWall,
			west: westWall,
			up: upWall,
			down: downWall,
		} = maze[y][x][z];
		if (currentLocation === end) {
			console.log('Made it to the end of the maze!');
		}
		console.log(`BBBB currentLocation ${currentLocation}: previousLocations: ${previousLocations}`);
		console.log(
			`BBBB northWall: ${northWall}, southWall: ${southWall}, eastWall: ${eastWall}, westWall: ${westWall}, upWall: ${upWall}, downWall: ${downWall}`,
		);

		return [];
	};
	const path = traverseMaze(0, 0, 0, []);

	// Example return array = ['0,0', '0,1', '1,1'] = ['x,y', 'x,y', 'x,y']
	return path;
}

import React, { useState } from 'react';
import './Default.css';

function Default() {
	const [count, setCount] = useState(0);

	return (
		<div>
			<p>This is for me to test simple React/JS/CSS stuff with. Nothing special, no backend</p>
			<p className="goals">
				<h2>Goals</h2>
				<ul>
					<li>5 Crowns</li>
					<li>Seven Dragons</li>
					<li>Potion Explosion</li>
					<li>Gizmos</li>
				</ul>
			</p>
			<p id="honors">Today&apos;s server is brought to you by the following:</p>
			<div>
				<a href="https://vitejs.dev" target="_blank" rel="noreferrer">
					<img src="/vite.svg" className="logo" alt="Vite logo" />
				</a>
				<a href="https://reactjs.org" target="_blank" rel="noreferrer">
					<img src="/react.svg" className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
			</div>
		</div>
	);
}

export default Default;

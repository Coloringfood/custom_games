import React from 'react';
import './App.css';
import AppRouter from '@/AppRouter.jsx';

function App() {
	return (
		<div className="App">
			<AppRouter isStandalone={true} />
		</div>
	);
}

export default App;

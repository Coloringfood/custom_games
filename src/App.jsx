import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { purple } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';
import AppRouter from '#/AppRouter.jsx';
const darkTheme = createTheme({
	palette: {
		// mode: 'dark',
		primary: {
			// Purple and green play nicely together.
			main: purple[500],
		},
		secondary: {
			// This is green.A700 as hex.
			main: '#11cb5f',
		},
	},
	components: {
		MuiDivider: {
			styleOverrides: {
				root: {
					marginTop: '20px',
					marginBottom: '20px',
				},
			},
		},
		MuiTypography: {
			styleOverrides: {
				root: {
					marginBottom: '10px',
				},
			},
		},
	},
});
function App() {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<AppRouter isStandalone={true} />
		</ThemeProvider>
	);
}

export default App;

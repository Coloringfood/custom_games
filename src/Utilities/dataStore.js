const store = {};

const LOCAL_STORAGE_KEYS = {
	characters: 'gameCharacters',
	history: 'gameHistory',
};

store.loadCharacters = async () => {
	try {
		return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.characters));
	} catch (e) {
		console.warn('Failed to load Characters');
		return [];
	}
};

store.saveCharacters = async (characters) => {
	localStorage.setItem(LOCAL_STORAGE_KEYS.characters, JSON.stringify(characters));
};

store.loadGameHistory = async () => {
	try {
		return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.history));
	} catch (e) {
		console.warn('Failed to load Characters');
		return [];
	}
};

store.saveGameHistory = async (history) => {
	localStorage.setItem(LOCAL_STORAGE_KEYS.history, JSON.stringify(history));
};

export default store;

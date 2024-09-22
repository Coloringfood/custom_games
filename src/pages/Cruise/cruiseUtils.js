// const BASE_URL = 'http://api.timaeustech.com/cruise';
const BASE_URL = 'http://localhost:3000/cruise';
export const fetchCruiseData = async (filters) => {
	const url = new URL(BASE_URL);
	if (filters && Object.keys(filters).length > 0) {
		url.search = new URLSearchParams(filters).toString();
	}
	console.info('BBBB url: ', url, url.toString());
	return fetch(url)
		.then((res) => res.json())
		.then((response) => {
			console.info('BBBB response: ', response);
			return response.data?.entries || response.data || [];
		});
};

export const SHIP_NAMES_MAPPING = {
	ShipLogo_DisneyFantasy: 'Disney Fantasy',
	ShipLogo_DisneyMagic: 'Disney Magic',
	'Treasure-Logo-Blue-Horizontal': 'Disney Treasure',
};
export const mapShipNames = (shipName) => SHIP_NAMES_MAPPING[shipName] || shipName;

export const flatDataColumns = [
	{ field: 'name', headerName: 'Name', width: 300 },
	{
		field: 'shipName',
		headerName: 'Ship Name',
		width: 200,
		valueFormatter: mapShipNames,
	},
	{ field: 'dateCollected', headerName: 'Date Collected', width: 200 },
	{ field: 'startDate', headerName: 'Start Date', width: 200 },
	{ field: 'cheapestPrice', headerName: 'Cheapest Price', width: 100 },
	{ field: 'endDate', headerName: 'End Date', width: 200 },
	{ field: 'interiorPrice', headerName: 'Interior Price', width: 100 },
	{ field: 'oceanViewPrice', headerName: 'Ocean View Price', width: 100 },
	{ field: 'verandahPrice', headerName: 'Verandah Price', width: 100 },
	{ field: 'conciergePrice', headerName: 'Concierge Price', width: 100 },
	{ field: 'destinations', headerName: 'Destinations', width: 400 },
];
const paginationModel = { page: 0, pageSize: 5 };
const sortModel = [{ field: 'cheapestPrice', sort: 'asc' }];
const columnVisibilityModel = {
	endDate: false,
	interiorPrice: false,
	oceanViewPrice: false,
	verandahPrice: false,
	conciergePrice: false,
};
export const initialState = {
	pagination: { paginationModel },
	sorting: { sortModel },
	columns: { columnVisibilityModel },
};
export const dateStringModifiers = ['en-us', { hour: '2-digit', minute: '2-digit' }];

export const calculatePriceHistoryChanges = (priceHistory) => {
	const values = new Set();
	priceHistory.reduce((acc, cruise) => {
		values.add(cruise.cheapestPrice);
	});
	return values.size;
};

export const groupData = (data) => {
	const days = {};
	const events = [];
	const cruises = {};

	data.forEach((entry, index) => {
		entry.id = index;
		const {
			name,
			shipName,
			dateCollected,
			startDate,
			endDate,
			interiorPrice,
			oceanViewPrice,
			verandahPrice,
			conciergePrice,
			destinations,
		} = entry;
		const day = new Date(dateCollected).toLocaleDateString();
		const cheapestPrice = Math.min(
			interiorPrice || 99999,
			oceanViewPrice || 99999,
			verandahPrice || 99999,
			conciergePrice || 99999,
		);
		const cruiseData = {
			name,
			shipName,
			dateCollected: new Date(dateCollected).toLocaleDateString(...dateStringModifiers),
			startDate: new Date(startDate).toLocaleDateString(...dateStringModifiers),
			cheapestPrice,
			endDate: new Date(endDate).toLocaleDateString(...dateStringModifiers),
			interiorPrice,
			oceanViewPrice,
			verandahPrice,
			conciergePrice,
			destinations,
			id: index,
		};

		// check if this event is already added, if not add it
		const eventIndex = events.findIndex((event) => event.dateCollected === dateCollected);
		if (eventIndex === -1) {
			events.push({
				dateCollected,
				indexes: [index],
			});
		} else {
			events[eventIndex].indexes.push(index);
		}

		// Check if this day is already in the days array
		if (days[day] === undefined) {
			days[day] = {
				day,
				ships: [],
			};
		}
		days[day].ships.push(cruiseData);

		const cruiseName = `${shipName} - ${new Date(startDate).toLocaleDateString()}`;
		if (cruises[cruiseName] === undefined) {
			cruises[cruiseName] = {
				id: cruiseName,
				name,
				cruiseName,
				startDate: new Date(startDate).toLocaleDateString(),
				events: 0,
				changes: 0,
				cheapestPrice: 99999,
				priceHistory: [],
			};
		}
		cruises[cruiseName].priceHistory.push(cruiseData);
		cruises[cruiseName].events += 1;
		cruises[cruiseName].cheapestPrice = Math.min(cruises[cruiseName].cheapestPrice, cheapestPrice);
		cruises[cruiseName].changes = calculatePriceHistoryChanges(cruises[cruiseName].priceHistory);
	});

	const daysArray = Object.keys(days).map((key) => days[key]);
	daysArray.sort((a, b) => new Date(b.day) - new Date(a.day));
	events.sort((a, b) => new Date(b.dateCollected) - new Date(a.dateCollected));
	const cruiseArray = Object.keys(cruises).map((key) => cruises[key]);
	cruiseArray.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
	return {
		days: daysArray,
		events,
		cruises: cruiseArray,
	};
};

export default {
	fetchCruiseData,
	mapShipNames,
	flatDataColumns,
	initialState,
	dateStringModifiers,
	groupData,
};

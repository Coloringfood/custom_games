const SHIP_NAMES_MAPPING = {
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

export default {
	mapShipNames,
	flatDataColumns,
	initialState,
	dateStringModifiers,
};

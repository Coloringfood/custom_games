import styledC from 'styled-components';

export const ButtonWrapper = styledC.span`
	float: right;
	margin-top: 20px;
	& > button {
		margin-left: 10px;
	}
`;

export const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 500,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

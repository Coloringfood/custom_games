import React from 'react';
import styled from 'styled-components';
import _ from 'lodash';

const Wrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	padding-top: 50px;
	width: 720px;
	height: 1080px;
	margin: 0 auto;
`;

const Test = () => {
	console.log(_.shuffle([1, 2, 3, 4, 5, 6, 7, 8]));
	return <Wrapper>TEST</Wrapper>;
};

export default Test;

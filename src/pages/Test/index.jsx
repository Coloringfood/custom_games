import React from 'react';
import styled from 'styled-components';
import './test.css';

const Wrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	padding-top: 50px;
	width: 720px;
	height: 1080px;
	margin: 0 auto;
	text-align: center;
`;

const Book = styled.div`
	transform-style: preserve-3d;
	position: relative;
	height: 300px;
	cursor: pointer;
	backface-visibility: visible;
	margin: 0 auto;
	perspective: 1200px;
`;

const Page = styled.div`
	transform-style: preserve-3d;
	position: absolute;
	width: 200px;
	height: 100%;
	top: 0;
	left: 0;
	transform-origin: left center;
	transition: transform 0.5s ease-in-out, box-shadow 0.35s ease-in-out;
`;

const Test = () => {
	return (
		<Wrapper>
			<Book className="book">
				<Page className="back"></Page>
				<Page className="page6"></Page>
				<Page className="page5"></Page>
				<Page className="page4"></Page>
				<Page className="page3"></Page>
				<Page className="page2"></Page>
				<Page className="page1"></Page>
				<Page className="front"></Page>
			</Book>
		</Wrapper>
	);
};

export default Test;

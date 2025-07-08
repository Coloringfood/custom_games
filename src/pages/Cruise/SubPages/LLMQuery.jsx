import React from 'react';
import { Button, Paper } from '@mui/material';
import { fetchLLMQuery, getLLMQuerySuggestions } from '#/pages/Cruise/cruiseUtils.js';
import ReactMarkdown from 'react-markdown';

const LOCAL_STORAGE_KEY = 'llm_query_history';

class LLMQuery extends React.PureComponent {
	state = {
		question: '',
		answer: '',
		loading: false,
		error: null,
		suggestions: [],
		showSuggestions: false,
		selectedSuggestion: -1,
	};

	componentDidMount() {
		this.loadCachedQuestions();
	}

	loadCachedQuestions = () => {
		const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
		this.cachedQuestions = cached ? JSON.parse(cached) : [];
	};

	saveQuestionToCache = (question) => {
		if (!question.trim()) return;
		this.cachedQuestions = this.cachedQuestions || [];
		if (!this.cachedQuestions.includes(question)) {
			this.cachedQuestions.unshift(question);
			if (this.cachedQuestions.length > 20) this.cachedQuestions.length = 20;
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.cachedQuestions));
		}
	};

	handleInputChange = async (e) => {
		const value = e.target.value;
		this.setState({ question: value, showSuggestions: !!value, selectedSuggestion: -1 });
		if (!value.trim()) {
			this.setState({ suggestions: [] });
			return;
		}
		let suggestions = [];
		try {
			const apiSuggestions = await getLLMQuerySuggestions(value);
			suggestions = Array.isArray(apiSuggestions) ? apiSuggestions : [];
		} catch {
			// ignore API errors for suggestions
		}
		// Merge with cached questions
		const cached = (this.cachedQuestions || []).filter((q) =>
			q.toLowerCase().includes(value.toLowerCase()),
		);
		const merged = [...new Set([...cached, ...suggestions])];
		this.setState({ suggestions: merged });
	};

	handleSuggestionClick = (suggestion) => {
		this.setState({ question: suggestion, showSuggestions: false, selectedSuggestion: -1 });
	};

	handleKeyDown = (e) => {
		const { showSuggestions, suggestions, selectedSuggestion } = this.state;
		if (!showSuggestions || suggestions.length === 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			this.setState({ selectedSuggestion: (selectedSuggestion + 1) % suggestions.length });
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			this.setState({
				selectedSuggestion: (selectedSuggestion - 1 + suggestions.length) % suggestions.length,
			});
		} else if (e.key === 'Tab' || e.key === 'Enter') {
			if (selectedSuggestion >= 0 && selectedSuggestion < suggestions.length) {
				e.preventDefault();
				this.setState({
					question: suggestions[selectedSuggestion],
					showSuggestions: false,
					selectedSuggestion: -1,
				});
			}
		} else if (e.key === 'Escape') {
			this.setState({ showSuggestions: false, selectedSuggestion: -1 });
		}
	};

	handleBlur = () => {
		setTimeout(() => this.setState({ showSuggestions: false }), 100);
	};

	handleInputFocus = () => {
		const { question } = this.state;
		if (!question.trim()) {
			const lastThree = (this.cachedQuestions || []).slice(0, 3);
			this.setState({
				showSuggestions: lastThree.length > 0,
				suggestions: lastThree,
				selectedSuggestion: -1,
			});
		}
	};

	handleSubmit = async () => {
		const { question } = this.state;
		if (!question.trim()) return;
		this.setState({ loading: true, answer: '', error: null, showSuggestions: false });
		try {
			const res = await fetchLLMQuery(question);
			console.log('LLM Query Response:', res);
			this.setState({ answer: res.data?.answer || 'No answer found.' });
			this.saveQuestionToCache(question);
		} catch (err) {
			this.setState({ error: 'Error fetching answer.' });
		} finally {
			this.setState({ loading: false });
		}
	};

	render() {
		const { question, answer, loading, error, suggestions, showSuggestions, selectedSuggestion } =
			this.state;
		return (
			<Paper sx={{ p: 2, position: 'relative' }}>
				<div style={{ position: 'relative', display: 'inline-block', width: '80%' }}>
					<input
						type="text"
						value={question}
						onChange={this.handleInputChange}
						onKeyDown={this.handleKeyDown}
						onBlur={this.handleBlur}
						onFocus={this.handleInputFocus}
						placeholder="Ask a question about the cruise data"
						style={{ width: '100%', marginRight: 8 }}
						autoComplete="off"
					/>
					{showSuggestions && suggestions.length > 0 && (
						<ul
							style={{
								position: 'absolute',
								left: 0,
								right: 0,
								top: '100%',
								zIndex: 10,
								background: 'white',
								border: '1px solid #ccc',
								margin: 0,
								padding: 0,
								listStyle: 'none',
								maxHeight: 200,
								overflowY: 'auto',
							}}
						>
							{suggestions.map((s, i) => (
								<li
									key={s}
									onMouseDown={() => this.handleSuggestionClick(s)}
									style={{
										padding: '8px',
										background: i === selectedSuggestion ? '#eee' : 'white',
										cursor: 'pointer',
									}}
								>
									{s}
								</li>
							))}
						</ul>
					)}
				</div>
				<Button
					variant="contained"
					onClick={this.handleSubmit}
					disabled={loading || !question.trim()}
					style={{ marginLeft: 8 }}
				>
					{loading ? 'Loading...' : 'Ask'}
				</Button>
				<div style={{ marginTop: 16 }}>
					{error && <div style={{ color: 'red' }}>{error}</div>}
					{answer && (
						<div style={{ textAlign: 'left' }}>
							<strong>Answer:</strong> <ReactMarkdown>{answer}</ReactMarkdown>
						</div>
					)}
				</div>
			</Paper>
		);
	}
}

LLMQuery.propTypes = {};

export default LLMQuery;

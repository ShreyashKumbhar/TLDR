import React, { useState } from 'react';
import { useUI } from '../context/UIContext';
import { summaryService } from '../services/api';
import SummaryCard from '../components/SummaryCard';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Assuming there's a search endpoint, or use tags
      const response = await summaryService.getSummariesByTags([query], 0, 20);
      setResults(response.data.content || []);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed wide-feed">
      <div className="feed-background">
        <div className="background-pattern"></div>
      </div>
      <div className="feed-header">
        <h2>Search</h2>
      </div>
      <p className="feed-description">
        Discover summaries by topic, keyword, or author
      </p>
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search summaries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-submit">🔍</button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Searching...</div>
      ) : results.length > 0 ? (
        <>
          <div className="search-results-info">
            <p>Found {results.length} results for "{query}"</p>
          </div>
          {results.map(summary => (
            <SummaryCard key={summary.id} summary={summary} />
          ))}
        </>
      ) : query && !loading ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try different keywords or check your spelling</p>
          <div className="empty-actions">
            <button className="action-button primary" onClick={() => setQuery('')}>Clear Search</button>
          </div>
        </div>
      ) : (
        <div className="search-placeholder">
          <div className="placeholder-icon">💡</div>
          <h3>Start Your Search</h3>
          <p>Enter keywords, topics, or authors to find relevant summaries</p>
          <div className="search-suggestions">
            <span className="suggestion-tag" onClick={() => setQuery('technology')}>Technology</span>
            <span className="suggestion-tag" onClick={() => setQuery('science')}>Science</span>
            <span className="suggestion-tag" onClick={() => setQuery('politics')}>Politics</span>
            <span className="suggestion-tag" onClick={() => setQuery('health')}>Health</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
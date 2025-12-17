import React, { useState } from 'react';
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
    <div className="feed">
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
      ) : (
        results.map(summary => (
          <SummaryCard key={summary.id} summary={summary} />
        ))
      )}
    </div>
  );
}

export default SearchPage;
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { summaryService } from '../services/api';
import SummaryCard from '../components/SummaryCard';

const PAGE_SIZE = 20;

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageMeta, setPageMeta] = useState({
    first: true,
    last: false,
    totalPages: 1,
    totalElements: 0
  });

  const performSearch = useCallback(async (searchTerm, pageNum = 0) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await summaryService.searchSummaries(searchTerm, pageNum, PAGE_SIZE);
      const { content = [], first, last, totalPages, totalElements } = response.data;
      
      setResults(content);
      setPageMeta({
        first: Boolean(first),
        last: Boolean(last),
        totalPages: totalPages || 1,
        totalElements: totalElements || 0
      });
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
      setPageMeta({
        first: true,
        last: true,
        totalPages: 1,
        totalElements: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlPage = parseInt(searchParams.get('page') || '0', 10);
    
    if (urlQuery) {
      setQuery(urlQuery);
      setPage(urlPage);
      performSearch(urlQuery, urlPage);
    } else {
      setResults([]);
      setPage(0);
    }
  }, [searchParams, performSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setPage(0);
    setSearchParams({ q: query.trim(), page: '0' });
    performSearch(query.trim(), 0);
  };

  const handlePageChange = (newPage) => {
    if (!query.trim()) return;
    setPage(newPage);
    setSearchParams({ q: query.trim(), page: newPage.toString() });
    performSearch(query.trim(), newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="feed wide-feed">
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
            <p>Found {pageMeta.totalElements} {pageMeta.totalElements === 1 ? 'result' : 'results'} for "{query}"</p>
            {pageMeta.totalPages > 1 && (
              <p className="search-page-info">Page {page + 1} of {pageMeta.totalPages}</p>
            )}
          </div>
          {results.map(summary => (
            <SummaryCard key={summary.id} summary={summary} />
          ))}
          
          {pageMeta.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="button" 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0 || loading}
              >
                Previous
              </button>
              <button 
                className="button" 
                onClick={() => handlePageChange(page + 1)}
                disabled={pageMeta.last || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : query && !loading ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try different keywords or check your spelling</p>
          <div className="empty-actions">
            <button 
              className="action-button primary" 
              onClick={() => {
                setQuery('');
                setSearchParams({});
                setResults([]);
              }}
            >
              Clear Search
            </button>
          </div>
        </div>
      ) : (
        <div className="search-placeholder">
          <div className="placeholder-icon">💡</div>
          <h3>Start Your Search</h3>
          <p>Enter keywords, topics, or tags to find relevant summaries</p>
          <div className="search-suggestions">
            <span 
              className="suggestion-tag" 
              onClick={() => {
                setQuery('technology');
                setSearchParams({ q: 'technology', page: '0' });
                performSearch('technology', 0);
              }}
            >
              Technology
            </span>
            <span 
              className="suggestion-tag" 
              onClick={() => {
                setQuery('science');
                setSearchParams({ q: 'science', page: '0' });
                performSearch('science', 0);
              }}
            >
              Science
            </span>
            <span 
              className="suggestion-tag" 
              onClick={() => {
                setQuery('politics');
                setSearchParams({ q: 'politics', page: '0' });
                performSearch('politics', 0);
              }}
            >
              Politics
            </span>
            <span 
              className="suggestion-tag" 
              onClick={() => {
                setQuery('health');
                setSearchParams({ q: 'health', page: '0' });
                performSearch('health', 0);
              }}
            >
              Health
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
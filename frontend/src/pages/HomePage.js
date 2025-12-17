import React, { useState, useEffect } from 'react';
import { summaryService } from '../services/api';
import SummaryCard from '../components/SummaryCard';

function HomePage() {
  const PAGE_SIZE = 5;
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [pageMeta, setPageMeta] = useState({
    first: true,
    last: false,
    totalPages: 1,
    totalElements: 0
  });

  useEffect(() => {
    loadSummaries();
  }, [sortBy, page]);

  const handleSortChange = (value) => {
    if (sortBy === value) return;
    setSortBy(value);
    setPage(0);
  };

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const response = sortBy === 'top' 
        ? await summaryService.getTopSummaries(page, PAGE_SIZE)
        : await summaryService.getAllSummaries(page, PAGE_SIZE);

      const { content = [], first, last, totalPages, totalElements } = response.data;

      // If we navigated past the last page (e.g., after deleting a summary), move back.
      if (content.length === 0 && totalElements > 0 && page > 0 && last) {
        setPage((prev) => Math.max(prev - 1, 0));
        return;
      }

      setSummaries(content);
      setPageMeta({
        first: Boolean(first),
        last: Boolean(last),
        totalPages: totalPages || 1,
        totalElements: totalElements || 0
      });
    } catch (error) {
      console.error('Error loading summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed">
      <div className="feed-header">
        <h2>Home</h2>
        <div className="sort-buttons">
          <button 
            className={`sort-button ${sortBy === 'recent' ? 'active' : ''}`}
            onClick={() => handleSortChange('recent')}
          >
            Recent
          </button>
          <button 
            className={`sort-button ${sortBy === 'top' ? 'active' : ''}`}
            onClick={() => handleSortChange('top')}
          >
            Top
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading summaries...</div>
      ) : (
        <>
          {summaries.length === 0 ? (
            <div className="post-card">
              <p>No summaries found.</p>
            </div>
          ) : (
            summaries.map(summary => (
              <SummaryCard key={summary.id} summary={summary} />
            ))
          )}
          
          <div className="pagination">
            <button 
              className="button" 
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
            >
              Previous
            </button>
            <button 
              className="button" 
              onClick={() => setPage((prev) => prev + 1)}
              disabled={pageMeta.last || summaries.length === 0}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;

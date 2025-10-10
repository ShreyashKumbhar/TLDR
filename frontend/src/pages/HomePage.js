import React, { useState, useEffect } from 'react';
import { summaryService } from '../services/api';
import SummaryCard from '../components/SummaryCard';

function HomePage() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadSummaries();
  }, [sortBy, page]);

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const response = sortBy === 'top' 
        ? await summaryService.getTopSummaries(page)
        : await summaryService.getAllSummaries(page);
      setSummaries(response.data.content);
    } catch (error) {
      console.error('Error loading summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          className={`button ${sortBy === 'recent' ? '' : 'button-secondary'}`}
          onClick={() => setSortBy('recent')}
        >
          Recent
        </button>
        <button 
          className={`button ${sortBy === 'top' ? '' : 'button-secondary'}`}
          onClick={() => setSortBy('top')}
        >
          Top
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading summaries...</div>
      ) : (
        <>
          {summaries.map(summary => (
            <SummaryCard key={summary.id} summary={summary} />
          ))}
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {page > 0 && (
              <button className="button" onClick={() => setPage(page - 1)}>
                Previous
              </button>
            )}
            <button className="button" onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;

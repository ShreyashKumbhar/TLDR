import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { summaryService, circleService } from '../services/api';
import SummaryCard from '../components/SummaryCard';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const PAGE_SIZE = 5;
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageMeta, setPageMeta] = useState({
    first: true,
    last: false,
    totalPages: 1,
    totalElements: 0
  });
  const [followedCircles, setFollowedCircles] = useState([]);
  const [loadingCircles, setLoadingCircles] = useState(false);

  useEffect(() => {
    loadSummaries();
    if (user) {
      loadFollowedCircles();
    }
  }, [sortBy, page, user]);

  const handleSortChange = (value) => {
    if (sortBy === value) return;
    setSortBy(value);
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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

  const loadFollowedCircles = async () => {
    if (!user) return;
    try {
      setLoadingCircles(true);
      const response = await circleService.getFollowedCircles(user.id);
      setFollowedCircles(response.data || []);
    } catch (error) {
      console.error('Error loading followed circles:', error);
      setFollowedCircles([]);
    } finally {
      setLoadingCircles(false);
    }
  };

  return (
    <div className="home-layout">
      {/* Main Feed */}
      <div className="main-feed">
        <div className="feed-header">
          <div className="feed-header-left">
            <h2>Home</h2>
            <form onSubmit={handleSearch} className="home-search-form">
              <input
                type="text"
                placeholder="Search summaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="home-search-input"
              />
            </form>
          </div>
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

      {/* Right Sidebar - Following Circles */}
      <div className="right-sidebar">
        <div className="sidebar-section">
          <h3>Following</h3>
          {loadingCircles ? (
            <p className="sidebar-empty">Loading circles...</p>
          ) : followedCircles.length === 0 ? (
            <p className="sidebar-empty">No circles followed yet</p>
          ) : (
            followedCircles.map(circle => (
              <Link 
                key={circle.id} 
                to={`/circles/${circle.id}`}
                className="followed-circle"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="circle-info-compact">
                  <span className="circle-name-small">{circle.name}</span>
                  {circle.postCount !== undefined && (
                    <span className="circle-meta-small">
                      {circle.postCount} {circle.postCount === 1 ? 'post' : 'posts'}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;

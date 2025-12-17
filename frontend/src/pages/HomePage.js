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
  const [topStories, setTopStories] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);

  useEffect(() => {
    loadSummaries();
    loadTopStories();
    loadFollowedUsers();
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

  const loadTopStories = async () => {
    try {
      const response = await summaryService.getTopSummaries(0, 5);
      setTopStories(response.data.content || []);
    } catch (error) {
      console.error('Error loading top stories:', error);
    }
  };

  const loadFollowedUsers = async () => {
    // Mock data for followed users - replace with actual API call when backend supports following
    setFollowedUsers([
      { id: 1, username: 'techguru', lastActive: '2h ago', activity: 'Posted a summary' },
      { id: 2, username: 'sciencefan', lastActive: '1d ago', activity: 'Commented on AI article' },
      { id: 3, username: 'newsreader', lastActive: '3h ago', activity: 'Upvoted 5 summaries' }
    ]);
  };

  return (
    <div className="home-layout">
      {/* Left Sidebar - Followed Users */}
      <div className="left-sidebar">
        <div className="sidebar-section">
          <h3>Following</h3>
          {followedUsers.length === 0 ? (
            <p className="sidebar-empty">No users followed yet</p>
          ) : (
            followedUsers.map(user => (
              <div key={user.id} className="followed-user">
                <div className="user-avatar-small">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info-compact">
                  <span className="username-small">{user.username}</span>
                  <span className="activity-small">{user.activity}</span>
                  <span className="last-active">{user.lastActive}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Feed */}
      <div className="main-feed">
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

      {/* Right Sidebar - Top Stories */}
      <div className="right-sidebar">
        <div className="sidebar-section">
          <h3>Top Stories</h3>
          {topStories.length === 0 ? (
            <p className="sidebar-empty">No top stories yet</p>
          ) : (
            topStories.map(story => (
              <div key={story.id} className="top-story">
                <h4 className="story-title">{story.title}</h4>
                <div className="story-meta">
                  <span className="story-author">{story.username || `User ${story.userId}`}</span>
                  <span className="story-votes">▲ {story.voteCount || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;

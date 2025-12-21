import React, { useState, useEffect } from 'react';
import { circleService } from '../services/api';

function CircleSelector({ selectedCircles, onCirclesChange, userId }) {
  const [circles, setCircles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    setLoading(true);
    try {
      const response = await circleService.getAllCircles(0, 50, userId);
      setCircles(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error loading circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchTerm(query);
    if (query.length > 0) {
      setLoading(true);
      try {
        const response = await circleService.searchCircles(query, 0, 20, userId);
        setCircles(response.data.content || response.data || []);
      } catch (error) {
        console.error('Error searching circles:', error);
      } finally {
        setLoading(false);
      }
    } else {
      loadCircles();
    }
  };

  const toggleCircle = (circleId) => {
    const newSelected = selectedCircles.includes(circleId)
      ? selectedCircles.filter(id => id !== circleId)
      : [...selectedCircles, circleId];
    onCirclesChange(newSelected);
  };

  const removeCircle = (circleId) => {
    onCirclesChange(selectedCircles.filter(id => id !== circleId));
  };

  const selectedCircleObjects = circles.filter(c => selectedCircles.includes(c.id));

  return (
    <div className="circle-selector">
      <label className="form-group label">
        Circles (select one or more)
      </label>
      
      {/* Selected circles display */}
      {selectedCircleObjects.length > 0 && (
        <div className="selected-circles" style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {selectedCircleObjects.map(circle => (
            <span key={circle.id} className="selected-circle-tag" style={{
              background: 'var(--amber)',
              color: 'var(--deep-navy)',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {circle.name}
              <button
                type="button"
                onClick={() => removeCircle(circle.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search circles..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          style={{ marginBottom: '0' }}
        />
        
        {/* Dropdown */}
        {showDropdown && (
          <div className="circle-dropdown" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            marginTop: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {loading ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading...
              </div>
            ) : circles.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No circles found
              </div>
            ) : (
              circles.map(circle => (
                <div
                  key={circle.id}
                  onClick={() => {
                    toggleCircle(circle.id);
                    if (!selectedCircles.includes(circle.id)) {
                      setShowDropdown(false);
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: selectedCircles.includes(circle.id) 
                      ? 'var(--amber)' 
                      : 'transparent',
                    color: selectedCircles.includes(circle.id)
                      ? 'var(--deep-navy)'
                      : 'var(--text-on-surface)'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedCircles.includes(circle.id)) {
                      e.currentTarget.style.background = 'var(--border-subtle)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedCircles.includes(circle.id)) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>{circle.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {circle.type} {circle.description && `• ${circle.description.substring(0, 50)}...`}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      {showDropdown && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

export default CircleSelector;


import { useState, useCallback } from 'react';
import { voteService } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Shared vote controller with soft physics-friendly callbacks.
 */
export function useVote(summary) {
  const { user } = useAuth();
  const [voteCount, setVoteCount] = useState(summary.voteCount || 0);
  const [userVote, setUserVote] = useState(0);
  const currentUserId = user?.id;

  const handleVote = useCallback(async (value) => {
    if (!currentUserId) {
      alert('Please sign in to vote on summaries.');
      return { success: false };
    }

    try {
      if (userVote === value) {
        await voteService.removeVote(currentUserId, summary.id);
        setUserVote(0);
        setVoteCount((prev) => prev - value);
        return { success: true, delta: -value };
      }

      await voteService.castVote(currentUserId, summary.id, value);
      setVoteCount((prev) => prev - userVote + value);
      setUserVote(value);
      return { success: true, delta: value - userVote };
    } catch (error) {
      console.error('Error voting:', error);
      return { success: false, error };
    }
  }, [currentUserId, summary.id, userVote]);

  return {
    voteCount,
    userVote,
    handleVote,
    isAuthenticated: Boolean(currentUserId)
  };
}

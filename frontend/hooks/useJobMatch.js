import { useState } from 'react';
import api from '../lib/api';

export const useJobMatch = () => {
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const matchJob = async (resumeId, jobDescriptionId) => {
    setLoading(true); setError(null);
    try {
      const res = await api.post('/job-match/match', { resumeId, jobDescriptionId });
      setMatchResult(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Job matching failed');
      throw err;
    } finally { setLoading(false); }
  };

  return { matchResult, loading, error, matchJob };
};

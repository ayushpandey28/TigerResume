'use client';

import { createContext, useState, useCallback } from 'react';

import {
  fetchResumes,
  fetchResumeById,
  uploadResumeFile,
  updateResumeData,
  deleteResumeById,
  fetchResumeVersions
} from '../lib/api';

export const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadResumes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchResumes();
      const data = res.data || [];

      setResumes(data);

      if (data.length > 0) {
        setActiveResume(prev => prev || data[0]);
      }

      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadResumeById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchResumeById(id);
      setActiveResume(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resume');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadResume = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const res = await uploadResumeFile(file);
      const newResume = res.data;

      setResumes(prev => [newResume, ...prev]);
      setActiveResume(newResume);

      return newResume;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload resume';

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateResume = async (id, data) => {
    setLoading(true);
    setError(null);

    try {
      const res = await updateResumeData(id, data);
      const updated = res.data;

      setResumes(prev =>
        prev.map(r => r._id === id ? updated : r)
      );

      setActiveResume(updated);

      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update resume';

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await deleteResumeById(id);

      setResumes(prev =>
        prev.filter(r => r._id !== id)
      );

      if (activeResume?._id === id) {
        setActiveResume(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete resume';

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (id) => {
    try {
      const res = await fetchResumeVersions(id);
      setVersions(res.data || []);

      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load versions'
      );
    }
  };

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        activeResume,
        setActiveResume,
        versions,
        selectedJob,
        setSelectedJob,
        loading,
        error,
        loadResumes,
        loadResumeById,
        uploadResume,
        updateResume,
        deleteResume,
        loadVersions
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}
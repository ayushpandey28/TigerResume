'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function JobInput({ onSave, onAnalyze, initialData = null }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    company: initialData?.company || '',
    description: initialData?.description || initialData?.rawText || ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e, shouldAnalyze = false) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Job Title is required');
      return;
    }

    setSubmitting(true);
    try {
      if (shouldAnalyze && onAnalyze) {
        await onAnalyze(formData);
      } else if (onSave) {
        await onSave(formData);
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
        {initialData ? 'Edit Job Description' : 'Add / Paste Job Description'}
      </h3>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid-2" style={{ marginBottom: '16px' }}>
          <div>
            <label>Job Title *</label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Company (Optional)</label>
            <input
              type="text"
              placeholder="e.g. TechCorp"
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Job Description Text *</label>
          <textarea
            rows={8}
            placeholder="Paste the full job description text, requirements, and responsibilities..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-outline"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Job Description'}
          </button>

          {onAnalyze && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Save & Analyze with AI'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}


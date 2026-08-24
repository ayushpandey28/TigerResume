'use client';
import TemplateRenderer from '../templates/TemplateRenderer';

export default function ResumePreview({ resume, templateId = 'classic', customization = {} }) {
  if (!resume) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-light)' }}>No resume selected to preview.</p>
      </div>
    );
  }

  return (
    <TemplateRenderer
      templateId={templateId}
      resume={resume}
      customization={customization}
    />
  );
}



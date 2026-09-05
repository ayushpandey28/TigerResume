'use client';
import Classic from './Classic';
import Modern from './Modern';
import Creative from './Creative';
import { normalizeResumeData } from '../../lib/resumeNormalizer';

export default function TemplateRenderer({ templateId = 'classic', resume, customization = {} }) {
  if (!resume) return null;

  const normalizedResume = normalizeResumeData(resume);

  switch (templateId.toLowerCase()) {
    case 'modern':
      return <Modern resume={normalizedResume} customization={customization} />;
    case 'creative':
      return <Creative resume={normalizedResume} customization={customization} />;
    case 'classic':
    default:
      return <Classic resume={normalizedResume} customization={customization} />;
  }
}

'use client';
import Classic from './Classic';
import Modern from './Modern';
import Creative from './Creative';

export default function TemplateRenderer({ templateId = 'classic', resume, customization = {} }) {
  if (!resume) return null;

  switch (templateId.toLowerCase()) {
    case 'modern':
      return <Modern resume={resume} customization={customization} />;
    case 'creative':
      return <Creative resume={resume} customization={customization} />;
    case 'classic':
    default:
      return <Classic resume={resume} customization={customization} />;
  }
}

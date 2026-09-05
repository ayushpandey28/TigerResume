'use client';
import { useState, useEffect } from 'react';
import { updateResumeDocumentModel, generateEditedResumePdf } from '../../lib/api';
import {
  FiSave,
  FiDownload,
  FiPlus,
  FiTrash2,
  FiLayers,
  FiList,
  FiAlignLeft,
  FiTag,
  FiBold,
  FiItalic,
  FiZoomIn,
  FiZoomOut,
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EditableDocumentEditor({ resume, onSaveSuccess }) {
  const [model, setModel] = useState(null);
  const [viewMode, setViewMode] = useState('visual');
  const [selectedElId, setSelectedElId] = useState(null);
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [zoomScale, setZoomScale] = useState(0.85);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (resume?.documentModel) {
      const cloned = JSON.parse(JSON.stringify(resume.documentModel));
      setModel(cloned);
      if (Array.isArray(cloned.pages) && cloned.pages.length > 0) {
        setViewMode('visual');
      } else {
        setViewMode('structured');
      }
    } else if (resume) {
      // Create a documentModel representation from available resume data if missing
      const fallbackSections = [];
      if (resume.summary) {
        fallbackSections.push({
          id: 'sec_summary',
          title: 'PROFESSIONAL SUMMARY',
          blocks: [{ id: 'blk_s1', type: 'paragraph', text: resume.summary }]
        });
      }
      if (Array.isArray(resume.skills) && resume.skills.length > 0) {
        fallbackSections.push({
          id: 'sec_skills',
          title: 'SKILLS',
          blocks: [{ id: 'blk_sk1', type: 'key_value', key: 'Skills', value: resume.skills.join(', ') }]
        });
      }
      if (Array.isArray(resume.experience) && resume.experience.length > 0) {
        const blocks = [];
        resume.experience.forEach((exp, idx) => {
          blocks.push({ id: `blk_e_t_${idx}`, type: 'heading', text: `${exp.title || 'Role'} — ${exp.company || ''}` });
          if (exp.description) blocks.push({ id: `blk_e_d_${idx}`, type: 'paragraph', text: exp.description });
          if (Array.isArray(exp.bullets)) {
            exp.bullets.forEach((b, bIdx) => blocks.push({ id: `blk_e_b_${idx}_${bIdx}`, type: 'bullet', text: b }));
          }
        });
        fallbackSections.push({ id: 'sec_exp', title: 'EXPERIENCE', blocks });
      }
      if (Array.isArray(resume.projects) && resume.projects.length > 0) {
        const blocks = [];
        resume.projects.forEach((proj, idx) => {
          blocks.push({ id: `blk_p_t_${idx}`, type: 'heading', text: proj.name || 'Project' });
          if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
            blocks.push({ id: `blk_p_tech_${idx}`, type: 'key_value', key: 'Technologies', value: proj.technologies.join(', ') });
          }
          if (Array.isArray(proj.bullets)) {
            proj.bullets.forEach((b, bIdx) => blocks.push({ id: `blk_p_b_${idx}_${bIdx}`, type: 'bullet', text: b }));
          }
        });
        fallbackSections.push({ id: 'sec_proj', title: 'PROJECTS', blocks });
      }
      if (Array.isArray(resume.education) && resume.education.length > 0) {
        const blocks = [];
        resume.education.forEach((edu, idx) => {
          blocks.push({ id: `blk_ed_${idx}`, type: 'paragraph', text: `${edu.degree || ''} • ${edu.institution || ''} (${edu.year || ''})` });
        });
        fallbackSections.push({ id: 'sec_edu', title: 'EDUCATION', blocks });
      }

      setModel({
        version: 1,
        header: {
          name: resume.contact?.name || resume.title || '',
          email: resume.contact?.email || '',
          phone: resume.contact?.phone || '',
          location: resume.contact?.location || '',
          links: [resume.contact?.linkedin, resume.contact?.github, resume.contact?.website].filter(Boolean)
        },
        sections: fallbackSections
      });
    }
  }, [resume]);

  if (!model) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-light)' }}>Loading document structure...</p>
      </div>
    );
  }

  // Visual Layout: Mutate exactly ONE element without side-effects
  const handleVisualElementChange = (pageIdx, elIdx, field, value) => {
    setModel(prev => {
      const copy = { ...prev };
      const pages = [...copy.pages];
      const targetPage = { ...pages[pageIdx] };
      const elements = [...targetPage.elements];
      elements[elIdx] = {
        ...elements[elIdx],
        [field]: value
      };
      targetPage.elements = elements;
      pages[pageIdx] = targetPage;
      copy.pages = pages;
      return copy;
    });
  };

  const handleNudgeElement = (pageIdx, elIdx, dx, dy) => {
    setModel(prev => {
      const copy = { ...prev };
      const pages = [...copy.pages];
      const targetPage = { ...pages[pageIdx] };
      const elements = [...targetPage.elements];
      const el = elements[elIdx];
      elements[elIdx] = {
        ...el,
        x: Math.round(((el.x || 0) + dx) * 100) / 100,
        y: Math.round(((el.y || 0) + dy) * 100) / 100
      };
      targetPage.elements = elements;
      pages[pageIdx] = targetPage;
      copy.pages = pages;
      return copy;
    });
  };

  const handleDeleteVisualElement = (pageIdx, elIdx) => {
    setModel(prev => {
      const copy = { ...prev };
      const pages = [...copy.pages];
      const targetPage = { ...pages[pageIdx] };
      const elements = [...targetPage.elements];
      elements.splice(elIdx, 1);
      targetPage.elements = elements;
      pages[pageIdx] = targetPage;
      copy.pages = pages;
      return copy;
    });
    setSelectedElId(null);
  };

  const handleAddVisualElement = (pageIdx) => {
    setModel(prev => {
      const copy = { ...prev };
      const pages = [...copy.pages];
      const targetPage = { ...pages[pageIdx] };
      const elements = [...(targetPage.elements || [])];
      const newId = `el_user_${Date.now()}`;
      elements.push({
        id: newId,
        type: 'text',
        x: 50,
        y: 60,
        width: 150,
        height: 14,
        text: 'New text element',
        fontSize: 10,
        fontFamily: 'Helvetica',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#1E293B',
        alignment: 'left',
        zIndex: elements.length + 1
      });
      targetPage.elements = elements;
      pages[pageIdx] = targetPage;
      copy.pages = pages;
      return copy;
    });
  };

  const handleHeaderChange = (field, value) => {
    setModel(prev => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value
      }
    }));
  };

  const handleSectionTitleChange = (secIdx, newTitle) => {
    setModel(prev => {
      const copy = { ...prev };
      copy.sections[secIdx].title = newTitle;
      return copy;
    });
  };

  const handleDeleteSection = (secIdx) => {
    if (window.confirm('Delete this section and its blocks?')) {
      setModel(prev => {
        const copy = { ...prev };
        copy.sections.splice(secIdx, 1);
        return copy;
      });
    }
  };

  const handleBlockChange = (secIdx, blkIdx, field, val) => {
    setModel(prev => {
      const copy = { ...prev };
      copy.sections[secIdx].blocks[blkIdx][field] = val;
      return copy;
    });
  };

  const handleDeleteBlock = (secIdx, blkIdx) => {
    setModel(prev => {
      const copy = { ...prev };
      copy.sections[secIdx].blocks.splice(blkIdx, 1);
      return copy;
    });
  };

  const handleAddBlock = (secIdx, type) => {
    setModel(prev => {
      const copy = { ...prev };
      const blkId = `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      if (type === 'bullet') {
        copy.sections[secIdx].blocks.push({ id: blkId, type: 'bullet', text: 'New bullet achievement' });
      } else if (type === 'key_value') {
        copy.sections[secIdx].blocks.push({ id: blkId, type: 'key_value', key: 'Label', value: 'Values' });
      } else if (type === 'paragraph') {
        copy.sections[secIdx].blocks.push({ id: blkId, type: 'paragraph', text: 'New paragraph description' });
      } else if (type === 'heading') {
        copy.sections[secIdx].blocks.push({ id: blkId, type: 'heading', text: 'Subheading' });
      }
      return copy;
    });
  };

  const handleAddSection = () => {
    const title = window.prompt('Enter section title (e.g. CERTIFICATIONS, PATENTS, LEADERSHIP):');
    if (!title || !title.trim()) return;
    setModel(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `sec_${Date.now()}`,
          title: title.trim().toUpperCase(),
          blocks: [
            { id: `blk_${Date.now()}`, type: 'bullet', text: 'First item' }
          ]
        }
      ]
    }));
  };

  const handleSave = async () => {
    if (!resume?._id) return;
    setSaving(true);
    try {
      await updateResumeDocumentModel(resume._id, model);
      toast.success('Document model saved successfully!');
      if (onSaveSuccess) onSaveSuccess(model);
    } catch (err) {
      toast.error('Failed to save document changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadEdited = async () => {
    if (!resume?._id) return;
    setDownloading(true);
    try {
      // Automatically save first if there are unpersisted edits
      await updateResumeDocumentModel(resume._id, model);
      const blob = await generateEditedResumePdf(resume._id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      const candidateName = model.header?.name || 'Resume';
      a.download = `${candidateName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Edited_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Edited layout PDF downloaded!');
    } catch (err) {
      toast.error('Failed to generate edited PDF');
    } finally {
      setDownloading(false);
    }
  };

  const hasPhysicalPages = Array.isArray(model.pages) && model.pages.length > 0;

  // Selected element lookup for Visual Page View
  let selectedElement = null;
  let selectedElementIdx = -1;
  if (hasPhysicalPages && selectedElId) {
    const page = model.pages[selectedPageIdx] || model.pages[0];
    if (page && Array.isArray(page.elements)) {
      selectedElementIdx = page.elements.findIndex(e => e.id === selectedElId);
      if (selectedElementIdx !== -1) {
        selectedElement = page.elements[selectedElementIdx];
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Control Header */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiLayers style={{ color: 'var(--primary)' }} /> Layout-Aware Document Editor
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-light)', marginTop: '2px' }}>
            Preserves physical layout coordinates, columns, typography, and ordering of your original document.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--border)', borderRadius: '6px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              disabled={!hasPhysicalPages}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: hasPhysicalPages ? 'pointer' : 'not-allowed',
                background: viewMode === 'visual' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'visual' ? '#fff' : 'var(--text-light)',
                opacity: hasPhysicalPages ? 1 : 0.5
              }}
              title={hasPhysicalPages ? 'Visual coordinate-preserving page view' : 'Physical page layout not available for this document'}
            >
              Visual Page View {hasPhysicalPages ? `(${model.pages.length}p)` : ''}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('structured')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'structured' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'structured' ? '#fff' : 'var(--text-light)'
              }}
            >
              Structured Block View
            </button>
          </div>

          <button
            onClick={handleDownloadEdited}
            className="btn btn-outline"
            disabled={downloading}
            style={{ padding: '8px 14px', fontSize: '13px' }}
          >
            <FiDownload /> {downloading ? 'Generating...' : 'Download Edited PDF'}
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* VISUAL PAGE VIEW */}
      {viewMode === 'visual' && hasPhysicalPages && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Zoom & Page Info Bar */}
          <div className="card" style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-light)', fontWeight: 500 }}>
                Click any text element to select and edit. Coordinates and typography are preserved.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setZoomScale(s => Math.max(0.4, Math.round((s - 0.1) * 10) / 10))}
                title="Zoom Out"
              >
                <FiZoomOut size={13} />
              </button>
              <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '42px', textAlign: 'center' }}>
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setZoomScale(s => Math.min(1.4, Math.round((s + 0.1) * 10) / 10))}
                title="Zoom In"
              >
                <FiZoomIn size={13} />
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setZoomScale(0.85)}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Floating / Selected Element Inspector Toolbar */}
          {selectedElement && selectedElementIdx !== -1 && (
            <div
              className="card"
              style={{
                padding: '12px 18px',
                background: 'var(--bg-card)',
                border: '2px solid var(--primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCheck /> Selected Element: {selectedElement.id} (Page {selectedPageIdx + 1})
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>
                    X: {selectedElement.x}pt, Y: {selectedElement.y}pt
                  </span>
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteVisualElement(selectedPageIdx, selectedElementIdx)}
                    className="btn"
                    style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.15)', border: 'none' }}
                  >
                    <FiTrash2 size={12} /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedElId(null)}
                    className="btn btn-outline"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Text Edit Box */}
              <div>
                <textarea
                  value={selectedElement.text || ''}
                  onChange={(e) => handleVisualElementChange(selectedPageIdx, selectedElementIdx, 'text', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13.5px',
                    fontFamily: selectedElement.fontFamily || 'Helvetica, Arial, sans-serif',
                    fontWeight: selectedElement.fontWeight || 'normal',
                    fontStyle: selectedElement.fontStyle || 'normal',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    minHeight: '44px',
                    resize: 'vertical'
                  }}
                  placeholder="Element text"
                />
              </div>

              {/* Formatting Controls Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                {/* Font Size */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-light)' }}>Size:</label>
                  <input
                    type="number"
                    min="6"
                    max="48"
                    step="0.5"
                    value={selectedElement.fontSize || 10}
                    onChange={(e) => handleVisualElementChange(selectedPageIdx, selectedElementIdx, 'fontSize', parseFloat(e.target.value) || 10)}
                    style={{ width: '60px', padding: '4px 6px', fontSize: '12px', textAlign: 'center' }}
                  />
                </div>

                {/* Bold Toggle */}
                <button
                  type="button"
                  onClick={() => handleVisualElementChange(selectedPageIdx, selectedElementIdx, 'fontWeight', selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: selectedElement.fontWeight === 'bold' ? 'var(--primary)' : 'var(--bg-card)',
                    color: selectedElement.fontWeight === 'bold' ? '#fff' : 'var(--text)',
                    cursor: 'pointer'
                  }}
                  title="Bold"
                >
                  <FiBold size={13} />
                </button>

                {/* Italic Toggle */}
                <button
                  type="button"
                  onClick={() => handleVisualElementChange(selectedPageIdx, selectedElementIdx, 'fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: selectedElement.fontStyle === 'italic' ? 'var(--primary)' : 'var(--bg-card)',
                    color: selectedElement.fontStyle === 'italic' ? '#fff' : 'var(--text)',
                    cursor: 'pointer'
                  }}
                  title="Italic"
                >
                  <FiItalic size={13} />
                </button>

                {/* Color Swatches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-light)', marginRight: '2px' }}>Color:</label>
                  {['#0F172A', '#334155', '#2563EB', '#0284C7', '#059669', '#7C3AED'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleVisualElementChange(selectedPageIdx, selectedElementIdx, 'color', c)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: c,
                        border: selectedElement.color === c ? '2px solid var(--text)' : '1px solid rgba(0,0,0,0.15)',
                        cursor: 'pointer'
                      }}
                      title={c}
                    />
                  ))}
                </div>

                {/* Nudge Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-light)', marginRight: '2px' }}>Nudge:</label>
                  <button
                    type="button"
                    onClick={() => handleNudgeElement(selectedPageIdx, selectedElementIdx, 0, -2)}
                    className="btn btn-outline"
                    style={{ padding: '3px 6px' }}
                    title="Nudge Up (-2pt)"
                  >
                    <FiArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeElement(selectedPageIdx, selectedElementIdx, 0, 2)}
                    className="btn btn-outline"
                    style={{ padding: '3px 6px' }}
                    title="Nudge Down (+2pt)"
                  >
                    <FiArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeElement(selectedPageIdx, selectedElementIdx, -2, 0)}
                    className="btn btn-outline"
                    style={{ padding: '3px 6px' }}
                    title="Nudge Left (-2pt)"
                  >
                    <FiArrowLeft size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeElement(selectedPageIdx, selectedElementIdx, 2, 0)}
                    className="btn btn-outline"
                    style={{ padding: '3px 6px' }}
                    title="Nudge Right (+2pt)"
                  >
                    <FiArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render Physical Page Sheets */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', overflowX: 'auto', padding: '20px 0' }}>
            {model.pages.map((page, pIdx) => {
              const pWidth = page.width || 595.28;
              const pHeight = page.height || 841.89;

              return (
                <div key={`page_${page.pageNumber || pIdx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {/* Page Indicator & Add Text Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: `${pWidth * zoomScale}px`, maxWidth: '100%', padding: '0 4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-light)' }}>
                      Page {page.pageNumber || pIdx + 1} ({pWidth} × {pHeight} pt)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddVisualElement(pIdx)}
                      className="btn btn-outline"
                      style={{ padding: '3px 8px', fontSize: '11.5px' }}
                    >
                      <FiPlus size={11} /> Add Text Block
                    </button>
                  </div>

                  {/* Scaled Page Container */}
                  <div
                    style={{
                      width: `${pWidth * zoomScale}px`,
                      height: `${pHeight * zoomScale}px`,
                      position: 'relative',
                      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
                      background: '#ffffff',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Inner 1:1 Canvas with CSS Zoom Scale */}
                    <div
                      style={{
                        width: `${pWidth}px`,
                        height: `${pHeight}px`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transformOrigin: 'top left',
                        transform: `scale(${zoomScale})`
                      }}
                    >
                      {/* Render Each Positioned Element */}
                      {Array.isArray(page.elements) && page.elements.map((el, elIdx) => {
                        const isSelected = selectedElId === el.id;
                        const fontSize = el.fontSize || 10;
                        const fontWeight = el.fontWeight || 'normal';
                        const fontStyle = el.fontStyle || 'normal';
                        const color = el.color || '#1E293B';

                        return (
                          <div
                            key={el.id || `el_${pIdx}_${elIdx}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPageIdx(pIdx);
                              setSelectedElId(el.id);
                            }}
                            style={{
                              position: 'absolute',
                              left: `${el.x}px`,
                              top: `${el.y}px`,
                              fontSize: `${fontSize}px`,
                              fontFamily: el.fontFamily || 'Helvetica, Arial, sans-serif',
                              fontWeight: fontWeight,
                              fontStyle: fontStyle,
                              color: color,
                              lineHeight: 1.25,
                              whiteSpace: 'pre-wrap',
                              cursor: 'pointer',
                              padding: '1px 3px',
                              borderRadius: '2px',
                              border: isSelected ? '2px solid #2563eb' : '1px solid transparent',
                              backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                              zIndex: isSelected ? 999 : (el.zIndex || 1),
                              transition: 'border-color 0.15s ease'
                            }}
                            title={`Click to edit (${el.id}) at X:${el.x}, Y:${el.y}`}
                          >
                            {el.text}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STRUCTURED BLOCK VIEW */}
      {(viewMode === 'structured' || !hasPhysicalPages) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Candidate Header Information */}
      <div className="card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px', color: 'var(--text)' }}>
          Candidate Header Info
        </h4>
        <div className="grid-2" style={{ gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Candidate Name</label>
            <input
              type="text"
              value={model.header?.name || ''}
              onChange={(e) => handleHeaderChange('name', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px' }}
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={model.header?.email || ''}
              onChange={(e) => handleHeaderChange('email', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px' }}
              placeholder="e.g. john@example.com"
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Phone</label>
            <input
              type="text"
              value={model.header?.phone || ''}
              onChange={(e) => handleHeaderChange('phone', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px' }}
              placeholder="e.g. +1 555-0199"
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Location</label>
            <input
              type="text"
              value={model.header?.location || ''}
              onChange={(e) => handleHeaderChange('location', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px' }}
              placeholder="e.g. San Francisco, CA"
            />
          </div>
        </div>
      </div>

      {/* Sections and Blocks Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {model.sections.map((section, secIdx) => (
          <div key={section.id || secIdx} className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
            {/* Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '16px' }}>
                <span className="badge badge-info" style={{ fontSize: '11px' }}>Section {secIdx + 1}</span>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleSectionTitleChange(secIdx, e.target.value)}
                  style={{
                    fontWeight: 700,
                    fontSize: '14.5px',
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    width: '100%',
                    maxWidth: '400px'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => handleDeleteSection(secIdx)}
                style={{ color: 'var(--danger)', background: 'transparent', padding: '6px' }}
                title="Delete Section"
              >
                <FiTrash2 size={16} />
              </button>
            </div>

            {/* Blocks in Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px' }}>
              {section.blocks.map((block, blkIdx) => (
                <div
                  key={block.id || blkIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 12px',
                    background: 'var(--bg)',
                    borderRadius: '6px',
                    border: '1px solid var(--border)'
                  }}
                >
                  {/* Block Type Tag */}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingTop: '6px', minWidth: '60px' }}>
                    {block.type === 'bullet' && '• Bullet'}
                    {block.type === 'key_value' && 'Tag: Value'}
                    {block.type === 'paragraph' && '¶ Text'}
                    {block.type === 'heading' && 'H Subhead'}
                  </span>

                  {/* Block Content by Type */}
                  <div style={{ flex: 1 }}>
                    {block.type === 'bullet' && (
                      <textarea
                        rows={2}
                        value={block.text}
                        onChange={(e) => handleBlockChange(secIdx, blkIdx, 'text', e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '13px', resize: 'vertical' }}
                      />
                    )}

                    {block.type === 'key_value' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={block.key || ''}
                          onChange={(e) => handleBlockChange(secIdx, blkIdx, 'key', e.target.value)}
                          placeholder="Label (e.g. Languages)"
                          style={{ width: '160px', padding: '6px 8px', fontSize: '13px', fontWeight: 600 }}
                        />
                        <input
                          type="text"
                          value={block.value || ''}
                          onChange={(e) => handleBlockChange(secIdx, blkIdx, 'value', e.target.value)}
                          placeholder="Value (e.g. Python, React)"
                          style={{ flex: 1, padding: '6px 8px', fontSize: '13px' }}
                        />
                      </div>
                    )}

                    {block.type === 'paragraph' && (
                      <textarea
                        rows={3}
                        value={block.text}
                        onChange={(e) => handleBlockChange(secIdx, blkIdx, 'text', e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '13px', resize: 'vertical' }}
                      />
                    )}

                    {block.type === 'heading' && (
                      <input
                        type="text"
                        value={block.text}
                        onChange={(e) => handleBlockChange(secIdx, blkIdx, 'text', e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '13.5px', fontWeight: 600 }}
                      />
                    )}
                  </div>

                  {/* Delete Block */}
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(secIdx, blkIdx)}
                    style={{ color: 'var(--text-muted)', background: 'transparent', padding: '4px', paddingTop: '6px' }}
                    title="Remove item"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Block Bar */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingLeft: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleAddBlock(secIdx, 'bullet')}
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
              >
                <FiList size={12} /> + Bullet
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock(secIdx, 'key_value')}
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
              >
                <FiTag size={12} /> + Key: Value
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock(secIdx, 'paragraph')}
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
              >
                <FiAlignLeft size={12} /> + Paragraph
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddSection}
          className="btn btn-outline"
          style={{ padding: '12px', borderStyle: 'dashed', justifyContent: 'center' }}
        >
          <FiPlus /> Add Custom Section to Document
        </button>
      </div>
    </div>
  )}
</div>
);
}

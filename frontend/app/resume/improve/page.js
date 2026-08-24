'use client';
import Sidebar from '../../../components/Sidebar';
import ResumeOptimizer from '../../../components/improvement/ResumeOptimizer';

export default function ResumeImprovePage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header">
          <h1>AI Resume Improvement & Optimization</h1>
          <p>Enhance summary, experience bullets, and project impact using AI recommendations with side-by-side review and version control</p>
        </div>

        <ResumeOptimizer />
      </div>
    </div>
  );
}


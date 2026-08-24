'use client';
import Sidebar from '../../../components/Sidebar';
import ResumeUploader from '../../../components/resume/ResumeUploader';
import { useResume } from '../../../hooks/useResume';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function ResumeUploadPage() {
  const { uploadResume } = useResume();
  const router = useRouter();

  const handleUploadSuccess = async (file) => {
    await uploadResume(file);
    router.push('/resume');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Upload Resume</h1>
            <p>Upload a PDF resume to extract contact, skills, experience & education</p>
          </div>
          <Link href="/resume" className="btn btn-outline">
            <FiArrowLeft /> Back to Resumes
          </Link>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <ResumeUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
}


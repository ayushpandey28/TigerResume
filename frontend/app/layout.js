import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { ResumeProvider } from '../context/ResumeContext';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'TigerResume - AI-Powered Resume Optimization',
  description: 'Analyze, optimize, and improve your resume with AI-powered ATS scoring and job matching.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ResumeProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster position="top-right" />
          </ResumeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

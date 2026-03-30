import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'EduStream – Free University Lectures',
  description: 'Stream free university courses from MIT, Stanford, Yale, Harvard and more. 900+ lectures, HD quality, completely free.',
  openGraph: {
    title: 'EduStream – Free University Lectures',
    description: 'Stream free university courses from MIT, Stanford, Yale, Harvard and more.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

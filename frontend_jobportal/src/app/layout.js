import { Inter } from 'next/font/google';
import Provider from './provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Job Portal — Find Your Dream Job',
  description: 'Real-time job portal with AI-powered matching',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
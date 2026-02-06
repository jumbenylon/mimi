import './globals.css';
import GlobalNav from './components/GlobalNav';

export const metadata = {
  title: 'MIMI Finance',
  description: 'Your Personal CFO',
  icons: { icon: '/icon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#F3F4F6]">
        {children}
        {/* The Nav lives here, outside the pages, persisting forever */}
        <GlobalNav />
      </body>
    </html>
  );
}

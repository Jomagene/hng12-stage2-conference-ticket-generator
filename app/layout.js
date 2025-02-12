import Header from '@/components/Header';
import './globals.css';
import '@fontsource/roboto';

export const metadata = {
  title: 'Conference ticket generator',
  description:
    'This is a conference ticket generator using next.js, tailwindcss, zod for form validation, cloudinary for media storage and local storage for persistance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-[roboto] dark-bg">
        <main className="main-container">
          <Header />
          {children}
        </main>
      </body>
    </html>
  );
}

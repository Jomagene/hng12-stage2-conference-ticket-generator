import Header from '@/components/Header';
import './globals.css';
import '@fontsource/roboto';
import { TicketProvider } from '@/context/TicketContext';

export const metadata = {
  title: 'Conference ticket generator',
  description:
    'This is a conference ticket generator using next.js, tailwindcss, zod for form validation, cloudinary for media storage and local storage for persistance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Road+Rage&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-[roboto] dark-bg">
        <TicketProvider>
          <main className="main-container">
            <Header />
            {children}
          </main>
        </TicketProvider>
      </body>
    </html>
  );
}

import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Escovra — The Agent Commerce Marketplace',
  description: 'The first ERC-8183 agent marketplace — post jobs, hire AI agents, get paid trustlessly on Base.',
  other: {
    'virtual-protocol-site-verification': '8cea71838e6e4aca35277c23c6460382'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

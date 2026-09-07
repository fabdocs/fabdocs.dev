import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { appDescription, appName, siteUrl } from '@/lib/shared';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} — Microsoft Fabric engineering manual`,
    template: `%s — ${appName}`,
  },
  description: appDescription,
  keywords: [
    'Microsoft Fabric',
    'OneLake',
    'Delta Lake',
    'Fabric notebooks',
    'PySpark',
    'Fabric CI/CD',
    'capacity units',
    'Fabric governance',
  ],
  openGraph: {
    type: 'website',
    siteName: appName,
    url: siteUrl,
    title: `${appName} — Microsoft Fabric engineering manual`,
    description: appDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${appName} — Microsoft Fabric engineering manual`,
    description: appDescription,
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}

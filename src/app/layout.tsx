import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import type { Metadata } from 'next';
import { appDescription, appName, siteUrl } from '@/lib/shared';

const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

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
        {/*
          OpenNext bundles the server with esbuild `keepNames`, which appends
          `__name(fn,"fn")` calls. next-themes serialises its init function to a
          string for an inline <script>, so that call can ship to the browser
          without its helper and throw `ReferenceError: __name is not defined`
          before the theme class is applied. Define a no-op first.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'globalThis.__name||(globalThis.__name=function(f){return f});',
          }}
        />
        <RootProvider>{children}</RootProvider>
        {cfBeaconToken ? (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={`{"token": "${cfBeaconToken}"}`}
          />
        ) : null}
      </body>
    </html>
  );
}

import './globals.css';

export const metadata = {
    title: 'GitHub Metrics Dashboard',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-[#050507] text-zinc-100 antialiased">
                {children}
            </body>
        </html>
    );
}

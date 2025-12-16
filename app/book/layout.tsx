'use client';

export default function BookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full min-h-screen">
            {children}
        </div>
    );
}

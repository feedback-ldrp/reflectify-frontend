// src/app/feedback/layout.tsx

export default function PublicFeedbackLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="min-h-screen">{children}</div>;
}

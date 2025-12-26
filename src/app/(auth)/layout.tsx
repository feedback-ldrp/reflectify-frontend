/**
 * @file src/app/(auth)/layout.tsx
 * @description Layout for authentication pages, providing a consistent structure.
 */

export const metadata = {
    title: "Authentication - Reflectify",
    description: "Login or Register pages",
    keywords: ["auth", "login", "register", "reflectify"],
    authors: [
        { name: "Kandarp Gajjar", url: "https://github.com/slantie" },
        { name: "Harsh Dodiya", url: "https://github.com/harshDodiya1" },
    ],
    icons: {
        icon: "/favicon.ico",
    },
};

export default function AuthGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div>{children}</div>;
}

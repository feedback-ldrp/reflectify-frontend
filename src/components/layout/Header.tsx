"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/Logo.svg";
import { useRouter } from "next/navigation";
import showToast from "@/lib/toast";

const HeaderRoute = (route: string, label: string) => {
    return (
        <Link
            href={route}
            className="text-secondary-dark dark:text-dark-tertiary hover:text-primary-dark dark:hover:text-primary-light transition-colors duration-200 font-medium text-sm md:text-base lg:text-lg"
        >
            {label}
        </Link>
    );
};

export function Header() {
    const router = useRouter();
    const { user, logout, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            setIsMobileMenuOpen(false);
        } catch (error) {
            showToast.error("Logout failed in Header: " + error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const headerVariants = {
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const logoVariants = {
        animate: {
            opacity: [0.8, 1, 0.8],
        },
        transition: {
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
        },
    };

    if (loading) {
        return (
            <motion.header
                initial="initial"
                animate="animate"
                variants={headerVariants}
                className="p-4 bg-white shadow-md dark:bg-gray-800 dark:text-gray-200 text-center border-b border-secondary-lighter dark:border-dark-secondary z-50 relative"
            >
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex justify-between items-center">
                    <span className="text-xl font-bold text-light-highlight dark:text-dark-highlight">
                        Reflectify
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Checking authentication...
                    </span>
                </div>
            </motion.header>
        );
    }

    return (
        <>
            <motion.header
                initial="initial"
                animate="animate"
                variants={headerVariants}
                className="bg-white dark:bg-dark-background border-b border-secondary-lighter dark:border-dark-secondary relative z-50"
            >
                <nav className="mx-auto max-w-[1920px] px-6 py-4 flex items-center justify-between">
                    {/* Logo / Site Title */}
                    <motion.div
                        className="text-2xl font-bold whitespace-nowrap"
                        variants={logoVariants}
                        initial="animate"
                    >
                        <div className="flex items-center gap-2">
                            <Link href="/" className="flex items-center gap-2">
                                <Image
                                    src={logo}
                                    alt="Reflectify Logo"
                                    width={32} // Smaller on mobile
                                    height={32} // Smaller on mobile
                                    className="object-contain lg:w-10 lg:h-10 md:w-8 md:h-8" // Larger on larger screens
                                    priority
                                />
                                <span className="lg:text-3xl md:text-xl font-bold">
                                    <span className="text-light-highlight dark:text-dark-highlight">
                                        Reflectify
                                    </span>
                                </span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4 lg:gap-4">
                        {!user && (
                            <>
                                <Link
                                    href="/about-us"
                                    className="text-secondary-dark dark:text-dark-tertiary hover:text-primary-dark dark:hover:text-primary-light transition-colors duration-200 font-medium text-sm lg:text-base"
                                >
                                    About Us
                                </Link>
                                <Link
                                    href="/docs"
                                    className="text-secondary-dark dark:text-dark-tertiary hover:text-primary-dark dark:hover:text-primary-light transition-colors duration-200 font-medium text-sm lg:text-base"
                                >
                                    Documentation
                                </Link>
                                <Link
                                    href="/contact"
                                    className="text-secondary-dark dark:text-dark-tertiary hover:text-primary-dark dark:hover:text-primary-light transition-colors duration-200 font-medium text-sm lg:text-base"
                                >
                                    Contact
                                </Link>
                                <ThemeToggle />
                            </>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3 lg:gap-4">
                                {HeaderRoute("/dashboard", "Dashboard")}

                                {user.isSuper &&
                                    HeaderRoute("/upload", "Upload")}
                                {user.isSuper &&
                                    HeaderRoute(
                                        "/feedback-forms",
                                        "Feedback Forms"
                                    )}
                                {user.isSuper &&
                                    HeaderRoute("/analytics", "Analytics")}

                                <ThemeToggle />

                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-lg bg-negative-main text-white hover:bg-negative-dark focus:ring-negative-main/50 text-md"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.push("/login")}
                                    className="px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-darker transition-colors duration-200 text-md font-semibold"
                                >
                                    Login
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button (Hamburger) */}
                    <div className="md:hidden flex items-center gap-3">
                        <ThemeToggle />
                        <Button
                            onClick={toggleMobileMenu}
                            className="px-2.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-dark rounded-md"
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" /> // Smaller icon for mobile
                            ) : (
                                <Menu className="w-5 h-5" /> // Smaller icon for mobile
                            )}
                        </Button>
                    </div>
                </nav>
            </motion.header>

            {/* Optional Backdrop for smoother UX */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                    aria-hidden="true"
                    onClick={toggleMobileMenu}
                />
            )}

            {/* Block scroll when menu is open */}
            {isMobileMenuOpen && (
                <style jsx global>{`
                    body {
                        overflow: hidden;
                    }
                `}</style>
            )}

            {/* Mobile Menu (Outside Header) */}
            <motion.div
                id="mobile-menu"
                initial={false}
                animate={isMobileMenuOpen ? "open" : "closed"}
                variants={{
                    open: { opacity: 1, y: 0, display: "block" },
                    closed: {
                        opacity: 0,
                        y: "-100%",
                        transitionEnd: { display: "none" },
                    },
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden fixed top-[64px] sm:top-[72px] left-0 w-full bg-white dark:bg-dark-background shadow-lg border-t border-secondary-lighter dark:border-dark-secondary overflow-hidden z-40"
            >
                <div className="flex flex-col p-4 space-y-3">
                    {!user && (
                        <>
                            <Link
                                href="/about-us"
                                className="block text-secondary-dark dark:text-dark-tertiary hover:text-primary-dark dark:hover:text-primary-light py-2 font-medium text-base"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                About Us
                            </Link>
                            <Link
                                href="/contact"
                                className="block text-secondary-dark dark:text-dark-tertiary hover:text-primary-dark dark:hover:text-primary-light py-2 font-medium text-base"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contact
                            </Link>
                        </>
                    )}

                    {user ? (
                        <>
                            <span className="block text-light-text dark:text-dark-text py-2 font-medium text-base">
                                Hello,{" "}
                                <span className="text-light-highlight dark:text-dark-highlight font-semibold">
                                    {user.name}
                                </span>
                            </span>
                            <Link
                                href="/dashboard"
                                className="block text-light-text dark:text-dark-text py-2 font-medium text-base"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            {user.isSuper && (
                                <Link
                                    href="/upload"
                                    className="block text-light-text dark:text-dark-text py-2 font-medium text-base"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Upload
                                </Link>
                            )}
                            {user.isSuper && (
                                <Link
                                    href="/feedback-forms"
                                    className="block text-light-text dark:text-dark-text py-2 font-medium text-base"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Feedback
                                </Link>
                            )}
                            {user.isSuper && (
                                <Link
                                    href="/analytics"
                                    className="block text-light-text dark:text-dark-text py-2 font-medium text-base"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Analytics
                                </Link>
                            )}
                            {/* {user.isSuper && (
                                <Link
                                    href="/faculty-analytics"
                                    className="block text-primary-dark dark:text-primary-light hover:underline py-2 font-medium text-base"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Faculty Analytics
                                </Link>
                            )} */}

                            {/* {process.env.NODE_ENV === "development" &&
                                user?.isSuper && (
                                    <Button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleDeleteAllData();
                                        }}
                                        variant="destructive"
                                        className="w-full mt-2 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                                        disabled={
                                            deleteAllDataMutation.isPending
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {deleteAllDataMutation.isPending
                                            ? "Deleting Database..."
                                            : "Delete Database (DEV)"}
                                    </Button>
                                )} */}

                            {/* <Link
                                href="/profile"
                                className="block px-4 py-2 bg-primary-dark text-white rounded-md text-center hover:bg-primary-darker transition-colors duration-200 mt-2 text-base font-semibold"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Profile
                            </Link> */}
                            <Button
                                onClick={handleLogout}
                                variant="destructive"
                                className="w-full mt-2 py-2.5 text-base font-semibold"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="block px-4 py-2 bg-primary-dark text-white rounded-md text-center hover:bg-primary-darker transition-colors duration-200 mt-2 text-base font-semibold"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Login
                        </Link>
                    )}
                </div>
            </motion.div>
        </>
    );
}

export default Header;

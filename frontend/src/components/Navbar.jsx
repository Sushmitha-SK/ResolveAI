import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosMenu } from "react-icons/io";
import { IoCloseOutline } from "react-icons/io5";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const token = localStorage.getItem("token");
    let user = localStorage.getItem("user");
    if (user) user = JSON.parse(user);

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative" id="navbar">
            <nav
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-4 md:px-16 lg:px-24 xl:px-32
                    flex items-center justify-between dark:bg-darkModeGray
                    ${isScrolled
                        ? "bg-white dark:bg-darkModeGray shadow-md py-3 md:py-4 text-gray-800 dark:text-gray-100"
                        : "bg-transparent py-4 md:py-6 text-black dark:text-gray-100"
                    }`}
                aria-label="Main Navigation"
            >
                {/* Logo */}
                <Link to="/"
                    aria-label="Go to homepage"
                    className="flex items-center gap-2"
                >
                    <div className="w-10 h-10 rounded-full bg-[#0388c9] bg-gradient-to-br from-[#92c7e2] to-darkBlue flex items-center justify-center shadow-mdtransition"
                        aria-hidden="true">
                        <span className="text-white font-bold text-lg font-poppins">R</span>
                    </div>
                    <h1 className="font-[600] text-xl text-[#0388c9] dark:text-blue-400 font-poppins tracking-wide">
                        Resolve AI
                    </h1>
                </Link>

                <div className="hidden md:flex items-center gap-6 lg:gap-10">
                    {!token ? (
                        <>
                            <Link to="/signup" className="hover:text-darkBlue dark:hover:text-blue-400">Signup</Link>
                            <Link to="/login" className="hover:text-darkBlue dark:hover:text-blue-400">Login</Link>
                        </>
                    ) : (
                        <>
                            <p>Hi, {user?.email}</p>
                            {user?.role === "admin" && (
                                <Link to="/admin" className="hover:text-darkBlue dark:hover:text-blue-400">Admin</Link>
                            )}
                            <button onClick={logout} className="hover:text-darkBlue dark:hover:text-blue-400">Logout</button>
                        </>
                    )}
                </div>

                <div className="flex md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        <IoIosMenu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <div
                    className={`fixed top-0 left-0 w-full h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col md:hidden items-center justify-center gap-6 font-medium transition-transform duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
                    role="dialog"
                    aria-modal="true"
                >
                    <button
                        className="absolute top-4 right-4"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close mobile menu"
                    >
                        <IoCloseOutline className="h-6 w-6" aria-hidden="true" />
                    </button>

                    {!token ? (
                        <>
                            <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Signup</Link>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                        </>
                    ) : (
                        <>
                            <p>Hi, {user?.email}</p>
                            {user?.role === "admin" && (
                                <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                            )}
                            <button onClick={() => { logout(); setIsMenuOpen(false); }}>Logout</button>
                        </>
                    )}
                </div>
            </nav>
            <div className="h-10 md:h-24" aria-hidden="true" />
        </div>
    );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, Info, Briefcase, Camera, MessageSquare, Menu, X } from 'lucide-react'; // Import Lucide icons
import useScreenWidth from '../hooks/useScreenWidth'; // Import the hook

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation(); // To determine active link
    const screenWidth = useScreenWidth(); // Get screen width
    const isMobileHeader = screenWidth < 768; // Define mobile breakpoint for this component

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const closeMenu = () => setIsMenuOpen(false);

    // Define navigation items for both desktop and mobile
    const navItems = [
        { to: "/", icon: Home, label: "Accueil" },
        { to: "/about", icon: Info, label: "À Propos" },
        { to: "/services", icon: Briefcase, label: "Services" },
        { to: "/portfolio", icon: Camera, label: "Portfolio" },
        { to: "/contact", icon: MessageSquare, label: "Contact" },
    ];

    return (
        <header className={`main-header ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}
                style={{ backgroundColor: 'white', color: 'black' }}>
            <div className="header-container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 10px',
                maxWidth: '960px',
                margin: '0 auto',
                minHeight: '40px'
            }}>
                <Link to="/" className="logo" onClick={closeMenu} style={{ color: 'black', textDecoration: 'none', fontSize: '1.2em', fontWeight: 'bold' }}>Netpub</Link>
                <nav className="main-nav" style={{ display: 'flex', gap: '15px' }}>
                    {navItems.map(item => (
                        <NavLink 
                            key={item.to} 
                            to={item.to} 
                            onClick={closeMenu} 
                            style={{ color: 'black', textDecoration: 'none !important', fontSize: '0.9em' }}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu" style={{ color: 'black', marginLeft: '10px' }}>
                    <span className="hamburger-icon"></span>
                </button>
            </div>

            {/* Mobile Navbar (fixed bottom bar) */}
            {isMobileHeader && ( // Conditionally render based on screen width
                <div className={`mobile-navbar ${isMenuOpen ? 'open' : ''} ${isScrolled ? 'scrolled' : ''}`}>
                {navItems.map(item => {
                    const isActive = location.pathname === item.to;
                    return (
                        <NavLink 
                            key={item.to} 
                            to={item.to} 
                            onClick={closeMenu} 
                            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={24} />
                            <span className="mobile-nav-label">{item.label}</span>
                        </NavLink>
                    );
                })}
                </div>
            )}
        </header>
    );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Info, Briefcase, Camera, MessageSquare } from 'lucide-react';
import './PillNavBar.css'; // Import the stylesheet

const PillNavBar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    

    const navItems = [
        { to: "/", icon: Home, label: "Accueil" },
        { to: "/about", icon: Info, label: "À Propos" },
        { to: "/services", icon: Briefcase, label: "Services" },
        { to: "/portfolio", icon: Camera, label: "Portfolio" },
        { to: "/contact", icon: MessageSquare, label: "Contact" },
    ];

    return (
        <div className="pill-nav-container">
            <nav className={`pill-nav ${isScrolled ? 'scrolled' : ''}`}>
                {navItems.map(item => {
                    const isActive = location.pathname === item.to;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={`pill-nav-item ${isActive ? 'active' : ''}`}
                            title={item.label} // Tooltip for accessibility
                        >
                            <item.icon size={22} />
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default PillNavBar;

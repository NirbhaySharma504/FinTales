import React from 'react';
import './Footer.scss';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} FinTales. All rights reserved.</p>
                <div className="social-links">
                    <a href="https://twitter.com/FinTales" target="_blank" rel="noopener noreferrer">Twitter</a>
                    <a href="https://github.com/FinTales" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://linkedin.com/company/fintales" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
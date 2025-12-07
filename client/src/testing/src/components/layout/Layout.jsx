import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css'; // Assuming you have a CSS file for layout styles

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
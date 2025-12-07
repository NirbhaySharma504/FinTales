import React from 'react';
import './card.scss'; // Assuming you have a separate SCSS file for card styles

const Card = ({ title, content, footer }) => {
    return (
        <div className="card">
            <div className="card-header">
                <h2>{title}</h2>
            </div>
            <div className="card-content">
                <p>{content}</p>
            </div>
            {footer && (
                <div className="card-footer">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
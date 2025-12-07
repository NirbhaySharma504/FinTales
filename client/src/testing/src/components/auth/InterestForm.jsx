import React, { useState } from 'react';
import './interests.scss';

const InterestForm = () => {
    const [interests, setInterests] = useState({
        interest1: false,
        interest2: false,
        interest3: false,
    });

    const handleChange = (event) => {
        const { name, checked } = event.target;
        setInterests((prevInterests) => ({
            ...prevInterests,
            [name]: checked,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic here
        console.log('Selected Interests:', interests);
    };

    return (
        <form onSubmit={handleSubmit} className="interest-form">
            <h2>Select Your Interests</h2>
            <label>
                <input
                    type="checkbox"
                    name="interest1"
                    checked={interests.interest1}
                    onChange={handleChange}
                />
                Interest 1
            </label>
            <label>
                <input
                    type="checkbox"
                    name="interest2"
                    checked={interests.interest2}
                    onChange={handleChange}
                />
                Interest 2
            </label>
            <label>
                <input
                    type="checkbox"
                    name="interest3"
                    checked={interests.interest3}
                    onChange={handleChange}
                />
                Interest 3
            </label>
            <button type="submit">Submit</button>
        </form>
    );
};

export default InterestForm;
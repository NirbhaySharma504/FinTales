import React, { useState } from 'react';

const PreferencesForm = () => {
    const [preferences, setPreferences] = useState({
        theme: 'light',
        notifications: true,
        language: 'en',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPreferences({
            ...preferences,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit preferences to the server or context
        console.log('Preferences submitted:', preferences);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>User Preferences</h2>
            <div>
                <label>
                    Theme:
                    <select name="theme" value={preferences.theme} onChange={handleChange}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Notifications:
                    <input
                        type="checkbox"
                        name="notifications"
                        checked={preferences.notifications}
                        onChange={handleChange}
                    />
                </label>
            </div>
            <div>
                <label>
                    Language:
                    <select name="language" value={preferences.language} onChange={handleChange}>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                    </select>
                </label>
            </div>
            <button type="submit">Save Preferences</button>
        </form>
    );
};

export default PreferencesForm;
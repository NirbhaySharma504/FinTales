import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import PreferencesForm from '../auth/PreferencesForm';
import './UpdatePreferences.scss';

const UpdatePreferences = () => {
    const { user, updateUserPreferences } = useContext(AuthContext);
    const [preferences, setPreferences] = useState(user.preferences || {});

    const handlePreferencesChange = (newPreferences) => {
        setPreferences(newPreferences);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        updateUserPreferences(preferences);
    };

    return (
        <div className="update-preferences">
            <h2>Update Your Preferences</h2>
            <PreferencesForm 
                preferences={preferences} 
                onPreferencesChange={handlePreferencesChange} 
                onSubmit={handleSubmit} 
            />
        </div>
    );
};

export default UpdatePreferences;
import React from 'react';
import PreferencesForm from '../auth/PreferencesForm';
import './preferences.scss';

const PreferencesPage = () => {
    return (
        <div className="preferences-page">
            <h1>User Preferences</h1>
            <PreferencesForm />
        </div>
    );
};

export default PreferencesPage;
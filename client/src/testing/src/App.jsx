import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './components/home/Home';
import AchievementsPage from './components/nfts/AchievementsPage';
import PreferencesPage from './components/preferences/PreferencesPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UpdatePreferences from './components/home/UpdatePreferences';
import './App.css';

const App = () => {
    return (
        <Router>
            <Layout>
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/achievements" component={AchievementsPage} />
                    <Route path="/preferences" component={PreferencesPage} />
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    <Route path="/update-preferences" component={UpdatePreferences} />
                </Switch>
            </Layout>
        </Router>
    );
};

export default App;
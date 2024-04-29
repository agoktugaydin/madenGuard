// src/App.js
import React, { useState, useEffect } from 'react';
import HomePage from '../src/pages/HomePage';
import DeviceLogPage from '../src/pages/DeviceLogPage';
import RegisterDevicePage from '../src/pages/RegisterDevicePage';
import ListDevicesPage from '../src/pages/ListDevicesPage';
import ListCustomersPage from '../src/pages/ListCustomersPage';
import RegisterCustomerPage from '../src/pages/RegisterCustomerPage';
import AllDevicesPage from './pages/DashBoardPage';
import MapPage from './pages/MapPage'

import './App.css';

import {
  Link,
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate
} from "react-router-dom";

import { AppBar, Tabs, Tab, Container, Button } from '@mui/material';
import DeviceDetailsPage from './pages/DeviceDetailsPage';
import EditDevicePage from './pages/EditDevicePage';
import LoginPage from './pages/LoginPage';

const App = () => {
  const [isLoggedIn, setLoggedIn] = useState(false); // Track login state

  // Function to handle logout
  const handleLogout = () => {
    // Perform logout actions, e.g., clear token, reset state, etc.
    // For now, let's just set isLoggedIn to false
    setLoggedIn(false);
    // Clear the token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    // Navigate to the login page after logout
    return <Navigate to="/login" />;
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    }
  }, []); // Empty dependency array ensures the effect runs only once on mount

  const isAdmin = localStorage.getItem('role') === 'ROLE_ADMIN'; // Check if the user is an admin

  const navbarStyle = {
    backgroundColor: '#2196f3', // '#2196f3', // primary color
    padding: '10px 0',
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const tabStyle = {
    flexGrow: 1,
    marginLeft: '16px',
  };

  const tabItemStyle = {
    marginRight: '16px',
    color: 'black',
    textDecoration: 'none',
  };

  const tabItemStyleDisabled = {
    marginRight: '16px',
    color: 'black',
    textDecoration: 'line-through',
  };

  const logoutButtonStyle = {
    color: 'black',
    borderColor: 'white',
    marginLeft: '16px',
  };

  return (
    <Router>

      <AppBar style={navbarStyle} position="static">
        <Container style={containerStyle}>
          <Tabs style={tabStyle}>
            <Tab style={tabItemStyle} label="Home" component={Link} to="/" />
            <Tab style={tabItemStyle} label="Device Log" component={Link} to="/device-log" />
            <Tab style={tabItemStyle} label="Map" component={Link} to="/map" />
            <Tab style={tabItemStyle} label="Dashboard" component={Link} to="/all-devices" />
            <Tab style={tabItemStyle} label="Device List" component={Link} to="/device-list" />
            <Tab style={tabItemStyle} label="Device Register" component={Link} to="/device-register" />
            {isAdmin && <Tab style={tabItemStyle} label="Customer List" component={Link} to="/customer-list" />}
            {isAdmin && <Tab style={tabItemStyle} label="Customer Register" component={Link} to="/customer-register" />}
          </Tabs>
          {isLoggedIn && (
            <Button style={logoutButtonStyle} color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Container>
      </AppBar>

      <Routes>
        <Route path="/" exact element={<HomePage isLoggedIn={isLoggedIn} />} />
        <Route path="/login" exact element={<LoginPage setLoggedIn={setLoggedIn} isLoggedIn={isLoggedIn} />} />
        <Route path="/device-log" exact element={<DeviceLogPage isLoggedIn={isLoggedIn} />} />
        <Route path="/device-list" exact element={<ListDevicesPage isLoggedIn={isLoggedIn} />} />
        <Route path="/device-register" exact element={<RegisterDevicePage isLoggedIn={isLoggedIn} />} />
        <Route path="/device-edit/:deviceId" exact element={<EditDevicePage isLoggedIn={isLoggedIn} />} />
        <Route path="/device-details/:deviceId" exact element={<DeviceDetailsPage isLoggedIn={isLoggedIn} />} />

        <Route path="/all-devices" exact element={<AllDevicesPage isLoggedIn={isLoggedIn} />} />
        <Route path="/map" exact element={<MapPage isLoggedIn={isLoggedIn} />} />

        <Route path="/customer-list" exact element={<ListCustomersPage isLoggedIn={isLoggedIn} />} />
        <Route path="/customer-register" exact element={<RegisterCustomerPage isLoggedIn={isLoggedIn} />} />
      </Routes>
    </Router>
  );
};


export default App;

import React, { useState, useEffect } from 'react';
import { Link, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppBar, Container, Button, Toolbar } from '@mui/material';
import HomePage from './pages/HomePage';
import DeviceLogPage from './pages/DeviceLogPage';
import RegisterDevicePage from './pages/RegisterDevicePage';
import ListDevicesPage from './pages/ListDevicesPage';
import ListCustomersPage from './pages/ListCustomersPage';
import RegisterCustomerPage from './pages/RegisterCustomerPage';
import AllDevicesPage from './pages/DashBoardPage';
import MapPage from './pages/MapPage';
import GraphPage from './pages/GraphPages/GraphPage';
import GraphEditor from './pages/GraphPages/GraphEditor';
import DeviceDetailsPage from './pages/DeviceDetailsPage';
import EditDevicePage from './pages/EditDevicePage';
import LoginPage from './pages/LoginPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import EditCustomerPage from './pages/EditCustomerPage';

import './App.css';

const App = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  const isAdmin = localStorage.getItem('role') === 'ROLE_ADMIN';

  const PrivateRoute = ({ element }) => {
    return isLoggedIn ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <AppBar className="navbar" position="static">
        <Container className="navbar-container">
          <Toolbar>
            <Button component={Link} to="/" color="inherit">Home</Button>
            {isLoggedIn && (
              <>
                <Button component={Link} to="/device-log" color="inherit">Device Log</Button>
                <Button component={Link} to="/graph-editor" color="inherit">Graph Editor</Button>
                <Button component={Link} to="/graph" color="inherit">Graph</Button>
                <Button component={Link} to="/all-devices" color="inherit">Dashboard</Button>
                <Button component={Link} to="/device-list" color="inherit">Device List</Button>
                <Button component={Link} to="/device-register" color="inherit">Device Register</Button>
                {isAdmin && <Button component={Link} to="/customer-list" color="inherit">Customer List</Button>}
                {isAdmin && <Button component={Link} to="/customer-register" color="inherit">Customer Register</Button>}
              </>
            )}
            {isLoggedIn ? (
              <Button className="logout-button" color="inherit" onClick={handleLogout}>Logout</Button>
            ) : (
              <Button component={Link} to="/login" color="inherit">Login</Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container className="main-container">
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<LoginPage setLoggedIn={setLoggedIn} isLoggedIn={isLoggedIn} />} />
          <Route path="/device-log" element={<PrivateRoute element={<DeviceLogPage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/graph-editor" element={<PrivateRoute element={<GraphEditor isLoggedIn={isLoggedIn} />} />} />
          <Route path="/graph" element={<PrivateRoute element={<GraphPage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/all-devices" element={<PrivateRoute element={<AllDevicesPage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/device-list" element={<PrivateRoute element={<ListDevicesPage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/device-register" element={<PrivateRoute element={<RegisterDevicePage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/device-edit/:deviceId" element={<PrivateRoute element={<EditDevicePage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/device-details/:deviceId" element={<PrivateRoute element={<DeviceDetailsPage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/map" element={<PrivateRoute element={<MapPage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/customer-list" element={<PrivateRoute element={<ListCustomersPage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/customer-register" element={<PrivateRoute element={<RegisterCustomerPage isLoggedIn={isLoggedIn} />} />} />

          <Route path="/customer-details/:customerId" element={<PrivateRoute element={<CustomerDetailsPage isLoggedIn={isLoggedIn} />} />} />
          <Route path="/customer-edit/:customerId" element={<PrivateRoute element={<EditCustomerPage isLoggedIn={isLoggedIn} />} />} />

        </Routes>
      </Container>
    </Router>
  );
};

export default App;

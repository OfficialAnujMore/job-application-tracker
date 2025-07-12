import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase/firebase';
import Home from './Screens/Home';
import Analytics from './Screens/Analytics';
import Login from './Screens/Login';
import Register from './Screens/Register';
import ApplicationForm from './Screens/ApplicationForm';
import ViewApplication from './Screens/ViewApplication';
import Splash from './MyComponents/Splash';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Splash />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/home" /> : <Register />}
        />
        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/analytics"
          element={user ? <Analytics /> : <Navigate to="/login" />}
        />
        <Route
          path="/application/new"
          element={user ? <ApplicationForm /> : <Navigate to="/login" />}
        />
        <Route
          path="/application/:id"
          element={user ? <ApplicationForm /> : <Navigate to="/login" />}
        />
        <Route
          path="/view/:id"
          element={user ? <ViewApplication /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;

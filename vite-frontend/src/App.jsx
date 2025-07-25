import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainApp from './MainApp';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

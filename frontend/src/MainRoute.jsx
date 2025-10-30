import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './page/Home';
import Register from './page/Register'
import Login from './page/Login'
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes
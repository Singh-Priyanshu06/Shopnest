import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

const normalizeUser = (userData) => {
    if (!userData) return null;
    const normalized = {
        _id: userData._id || userData.id || null,
        name: userData.name || userData.userName || '',
        email: userData.email || userData.Email || '',
        role: userData.role || 'user',
        token: userData.token || ''
    };
    if (!normalized._id || !normalized.token || !normalized.email || !normalized.email.includes('@')) {
        return null;
    }
    return normalized;
};

export const AuthProvider = ({children}) =>{
    const storedUser = localStorage.getItem('userInfo');
    const [user, setUser] = useState(() => {
        if (!storedUser) return null;
        const parsed = JSON.parse(storedUser);
        return normalizeUser(parsed);
    });

    const login = (userData) => {
        const normalized = normalizeUser(userData);
        setUser(normalized);
        localStorage.setItem('userInfo', JSON.stringify(normalized));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
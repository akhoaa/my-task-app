// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Cần cài đặt thư viện này

// Định nghĩa kiểu dữ liệu cho User
interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

// Định nghĩa kiểu dữ liệu cho AuthContext
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (newToken: string, userData: User) => void;
    logout: () => void;
}

// Tạo Context với giá trị mặc định
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo Provider Component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Kiểm tra token trong localStorage khi ứng dụng khởi động
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decodedUser: User = jwtDecode(storedToken);
                // Kiểm tra xem token đã hết hạn chưa (cần có trường 'exp' trong token)
                // const currentTime = Date.now() / 1000;
                // if (decodedUser.exp < currentTime) {
                //   logout();
                // } else {
                setToken(storedToken);
                setUser(decodedUser);
                // }
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        }
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Tạo custom hook để dễ dàng sử dụng context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
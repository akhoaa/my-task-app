// src/routes/AppRoutes.tsx

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';
// import TodoListPage from '../pages/TodoListPage'; // Sẽ tạo sau
// import AdminDashboard from '../pages/AdminDashboard'; // Sẽ tạo sau

// Component để bảo vệ các route chỉ dành cho người đã đăng nhập
const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    // Nếu đã đăng nhập, hiển thị component con (qua <Outlet />)
    // Nếu chưa, chuyển hướng về trang login
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Component để bảo vệ các route chỉ dành cho Admin
const AdminRoute = () => {
    const { user } = useAuth();
    // Nếu là admin, hiển thị component con
    // Nếu không, chuyển hướng về trang chính
    return user?.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};


const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Route công khai */}
            <Route path="/login" element={<LoginPage />} />

            {/* Route cần đăng nhập */}
            <Route element={<ProtectedRoute />}>
                {/* Ví dụ: trang chính sau khi đăng nhập */}
                {/* <Route path="/" element={<TodoListPage />} /> */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Các route cần đăng nhập khác */}
                {/* <Route path="/profile" element={<ProfilePage />} /> */}
            </Route>

            {/* Route cần quyền Admin (đã bao gồm cả việc phải đăng nhập) */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AdminRoute />}>
                    {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
                    <Route path="/admin/dashboard" element={<div>Trang Dashboard của Admin</div>} />
                    {/* Các route admin khác */}
                    {/* <Route path="/admin/users" element={<UserManagementPage />} /> */}
                </Route>
            </Route>

            {/* Route mặc định nếu không khớp */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRoutes;
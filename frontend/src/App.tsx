// src/App.tsx

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
    return (
        // Bước 1: Bọc toàn bộ ứng dụng trong AuthProvider.
        // Điều này cho phép mọi component con truy cập vào trạng thái đăng nhập.
        <AuthProvider>
            {/* Bước 2: Render component AppRoutes.
                AppRoutes sẽ lo việc quyết định trang nào (LoginPage, TodoListPage,...)
                sẽ được hiển thị dựa trên URL của trình duyệt. */}
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
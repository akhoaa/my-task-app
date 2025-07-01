// src/pages/LoginPage.tsx

import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    MDBContainer,
    MDBInput,
    MDBBtn,
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    MDBSpinner // Để hiển thị trạng thái loading
} from 'mdb-react-ui-kit';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Xác định trang sẽ chuyển hướng đến sau khi đăng nhập thành công
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Bước 1: Gọi API đăng nhập từ backend
            const response = await api.post('/auth/login', { email, password });

            // Backend trả về access_token và user object
            const { access_token, user } = response.data;

            // Bước 2: Gọi hàm login từ AuthContext để lưu token và thông tin user
            login(access_token, user);

            // Bước 3: Chuyển hướng người dùng đến trang họ muốn truy cập trước đó, hoặc trang chủ
            navigate(from, { replace: true });

        } catch (err: any) {
            // Hiển thị thông báo lỗi từ backend hoặc một thông báo chung
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MDBContainer fluid className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <MDBCard style={{ maxWidth: '400px', width: '100%' }}>
                <MDBCardBody>
                    <MDBCardTitle className="mb-4 text-center h3">Sign In</MDBCardTitle>

                    <form onSubmit={handleSubmit}>
                        <MDBInput
                            label='Email address'
                            type='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="mb-4"
                            disabled={loading}
                        />
                        <MDBInput
                            label='Password'
                            type='password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="mb-4"
                            disabled={loading}
                        />

                        {error && <p className="text-danger text-center small">{error}</p>}

                        <MDBBtn type='submit' block disabled={loading}>
                            {loading ? <MDBSpinner size='sm' role='status' tag='span' /> : 'Login'}
                        </MDBBtn>
                    </form>

                </MDBCardBody>
            </MDBCard>
        </MDBContainer>
    );
};

export default LoginPage;
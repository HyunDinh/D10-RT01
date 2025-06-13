import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Clients() {
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
        role: '',
        fullName: '',
        dateOfBirth: '',
        avatarUrl: '',
        isActive: true
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/api/clients', { withCredentials: true })
            .then(response => setClients(response.data))
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 403) {
                        // Chuyển hướng đến trang access-denied khi không có quyền
                        navigate('/hocho/access-denied');
                    } else if (error.response.status === 401) {
                        // Chuyển hướng đến trang login nếu chưa đăng nhập
                        navigate('/hocho/login');
                    }
                }
                console.error('Error fetching clients:', error);
            });
    }, [navigate]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const payload = {
            ...formData,
            phoneNumber: formData.role === 'child' ? 'none' : formData.phoneNumber,
            isActive: true
        };

        try {
            const response = await axios.post('http://localhost:8080/api/clients', payload, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            });
            setClients([...clients, response.data]);
            setFormData({
                username: '',
                password: '',
                email: '',
                phoneNumber: '',
                role: '',
                fullName: '',
                dateOfBirth: '',
                avatarUrl: '',
                isActive: true
            });
            setSuccessMessage('Thêm tài khoản thành công!');
        } catch (error) {
            console.error('Error adding client:', error.response?.data); // Log chi tiết lỗi
            setErrorMessage(error.response?.data?.message || 'Không thể thêm tài khoản. Vui lòng kiểm tra dữ liệu.');
        }
    };

    const handleDelete = async (id) => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await axios.delete(`http://localhost:8080/api/clients/${id}`, { withCredentials: true });
            setClients(clients.filter(client => client.id !== id));
            setSuccessMessage('Xóa tài khoản thành công!');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Không thể xóa tài khoản');
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        return new Date(dateTimeString).toLocaleString();
    };

    return (
        <div>
            <Header />
            <div className="table-container" style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
                <h1 className="text-center mb-4">Danh sách tài khoản</h1>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                name="username"
                                placeholder="Tên người dùng"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                name="fullName"
                                placeholder="Họ và tên"
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="date"
                                className="form-control"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                name="phoneNumber"
                                placeholder="Số điện thoại"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                disabled={formData.role === 'child'}
                                required={formData.role !== 'child'}
                            />
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="" disabled>Chọn vai trò</option>
                                <option value="child">CHILD</option>
                                <option value="parent">PARENT</option>
                                <option value="teacher">TEACHER</option>
                                <option value="admin">ADMIN</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <button type="submit" className="btn btn-primary w-100">Thêm</button>
                        </div>
                    </div>
                    {errorMessage && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}
                    {successMessage && <div className="success-message" style={{ color: 'green', marginTop: '10px' }}>{successMessage}</div>}
                </form>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Tên người dùng</th>
                            <th>Email</th>
                            <th>Họ và tên</th>
                            <th>Ngày sinh</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Cập nhật lần cuối</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {clients.length > 0 ? (
                            clients.map(client => (
                                <tr key={client.id}>
                                    <td>{client.id}</td>
                                    <td>{client.username}</td>
                                    <td>{client.email}</td>
                                    <td>{client.fullName}</td>
                                    <td>{client.dateOfBirth}</td>
                                    <td>{client.phoneNumber}</td>
                                    <td>{client.role}</td>
                                    <td>{client.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                                    <td>{formatDateTime(client.createdAt)}</td>
                                    <td>{formatDateTime(client.updatedAt)}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(client.id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center">Không tìm thấy tài khoản</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Clients;
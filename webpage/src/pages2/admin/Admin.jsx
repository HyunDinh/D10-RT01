import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Admin.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faEdit,
    faInfoCircle,
    faPlus,
    faTimes,
    faTrash,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Admin = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [pendingTeachers, setPendingTeachers] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        id: null,
        username: '',
        password: '',
        email: '',
        parentEmail: '',
        role: 'child',
        phoneNumber: '',
        fullName: '',
        dateOfBirth: '',
        isActive: true,
        verified: false
    });
    const [adminSearch, setAdminSearch] = useState('');
    const [parentSearch, setParentSearch] = useState('');
    const [teacherSearch, setTeacherSearch] = useState('');
    const [pendingTeacherSearch, setPendingTeacherSearch] = useState('');
    const [parentChildCounts, setParentChildCounts] = useState({});
    const [expandedParents, setExpandedParents] = useState({});
    const [childrenData, setChildrenData] = useState({});

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (role !== 'ROLE_ADMIN') {
            navigate('/hocho/login');
            return;
        }

        fetchUsers();
        fetchPendingTeachers();
    }, [navigate]);

    useEffect(() => {
        const fetchChildCounts = async () => {
            const counts = {};
            for (const parent of users.filter(user => user.role === 'parent')) {
                try {
                    const response = await axios.get(`http://localhost:8080/api/admin/users/${encodeURIComponent(parent.username)}/children/count`, {
                        withCredentials: true,
                    });
                    counts[parent.id] = response.data;
                } catch (err) {
                    console.error(`Error fetching child count for ${parent.username}:`, err);
                    counts[parent.id] = 0;
                }
            }
            setParentChildCounts(counts);
        };
        if (users.length > 0) {
            fetchChildCounts();
        }
    }, [users]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/users', {
                withCredentials: true,
            });
            setUsers(response.data);
            console.log('Users fetched:', response.data);
        } catch (err) {
            setError(`Lỗi khi tải danh sách người dùng: ${err.response?.data || err.message}`);
        }
    };

    const fetchPendingTeachers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/pending-teachers', {
                withCredentials: true,
            });
            setPendingTeachers(response.data);
        } catch (err) {
            setError(`Lỗi khi tải danh sách giáo viên chờ duyệt: ${err.response?.data || err.message}`);
        }
    };

    const fetchChildren = async (parentId, parentEmail) => {
        if (!parentEmail || parentChildCounts[parentId] === 0) return;
        try {
            const response = await axios.get(`http://localhost:8080/api/admin/users/${encodeURIComponent(parentEmail)}/children`, {
                withCredentials: true,
            });
            setChildrenData(prev => ({
                ...prev, [parentId]: response.data,
            }));
            console.log(`Fetched children for ${parentEmail}:`, response.data);
        } catch (err) {
            console.error(`Error fetching children for ${parentEmail}:`, err);
            setError(`Lỗi khi tải danh sách con cái: ${err.response?.data || err.message}`);
        }
    };

    const handleInputChange = (e) => {
        const {name, value, type, checked} = e.target;
        setCurrentUser({
            ...currentUser, [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (isEditing) {
                const response = await axios.put(`http://localhost:8080/api/admin/users/${currentUser.id}`, {
                    username: currentUser.username,
                    email: currentUser.email,
                    phoneNumber: currentUser.phoneNumber,
                    fullName: currentUser.fullName,
                    dateOfBirth: currentUser.dateOfBirth,
                    role: currentUser.role,
                    isActive: currentUser.isActive.toString(),
                    verified: currentUser.verified.toString(),
                }, {withCredentials: true});
                setMessage('Cập nhật người dùng thành công!');
                setUsers(users.map(user => user.id === currentUser.id ? response.data : user));
            } else {
                const payload = {
                    username: currentUser.username,
                    password: currentUser.password,
                    role: currentUser.role,
                    phoneNumber: currentUser.phoneNumber,
                    fullName: currentUser.fullName,
                    dateOfBirth: currentUser.dateOfBirth,
                };
                if (currentUser.role === 'child') {
                    payload.parentEmail = currentUser.parentEmail;
                } else {
                    payload.email = currentUser.email;
                }
                const response = await axios.post('http://localhost:8080/api/admin/users', payload, {
                    withCredentials: true,
                });
                setMessage(response.data || 'Thêm người dùng thành công!');
                fetchUsers();
            }
            setShowModal(false);
            setCurrentUser({
                id: null,
                username: '',
                password: '',
                email: '',
                parentEmail: '',
                role: 'child',
                phoneNumber: '',
                fullName: '',
                dateOfBirth: '',
                isActive: true,
                verified: false,
            });
        } catch (err) {
            setError(err.response?.data || 'Lỗi khi lưu người dùng.');
        }
    };

    const handleEdit = (user) => {
        setCurrentUser({
            id: user.id,
            username: user.username,
            password: '',
            email: user.email || '',
            parentEmail: user.parentEmail || '',
            role: user.role,
            phoneNumber: user.phoneNumber || '',
            fullName: user.fullName || '',
            dateOfBirth: user.dateOfBirth || '',
            isActive: user.isActive,
            verified: user.verified,
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
            try {
                const response = await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
                    withCredentials: true,
                });
                setMessage(response.data || 'Xóa người dùng thành công!');
                setUsers(users.filter(user => user.id !== id));
                // Cập nhật childrenData để xóa dữ liệu con cái nếu phụ huynh bị xóa
                setChildrenData(prev => {
                    const updated = {...prev};
                    Object.keys(updated).forEach(key => {
                        updated[key] = updated[key].filter(child => child.id !== id);
                        if (updated[key].length === 0) delete updated[key];
                    });
                    return updated;
                });
            } catch (err) {
                setError(err.response?.data || 'Lỗi khi xóa người dùng.');
            }
        }
    };

    const handleApproveTeacher = async (id) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/admin/approve-teacher/${id}`, {}, {
                withCredentials: true,
            });
            setMessage(response.data || 'Duyệt giáo viên thành công!');
            fetchPendingTeachers();
            fetchUsers();
        } catch (err) {
            setError(err.response?.data || 'Lỗi khi duyệt giáo viên.');
        }
    };

    const handleRejectTeacher = async (id) => {
        if (window.confirm('Bạn có chắc muốn từ chối giáo viên này?')) {
            try {
                const response = await axios.post(`http://localhost:8080/api/admin/reject-teacher/${id}`, {}, {
                    withCredentials: true,
                });
                setMessage(response.data || 'Từ chối giáo viên thành công!');
                fetchPendingTeachers();
            } catch (err) {
                setError(err.response?.data || 'Lỗi khi từ chối giáo viên.');
            }
        }
    };

    const handleViewTeacherInfo = (email) => {
        const sanitizedEmail = email.replace(/[^a-zA-Z0-9.-]/g, '_');
        window.open(`http://localhost:8080/api/hocho/teacher-verification/${sanitizedEmail}.png`, '_blank');
    };

    const openAddModal = () => {
        setIsEditing(false);
        setCurrentUser({
            id: null,
            username: '',
            password: '',
            email: '',
            parentEmail: '',
            role: 'child',
            phoneNumber: '',
            fullName: '',
            dateOfBirth: '',
            isActive: true,
            verified: false,
        });
        setShowModal(true);
    };

    const toggleParentChildren = (parentId, parentEmail) => {
        setExpandedParents(prev => ({
            ...prev, [parentId]: !prev[parentId],
        }));
        if (!expandedParents[parentId] && !childrenData[parentId]) {
            fetchChildren(parentId, parentEmail);
        }
    };

    // Filter functions
    const filteredAdmins = users.filter(user => user.role === 'admin' && (!adminSearch || user.email.toLowerCase().includes(adminSearch.toLowerCase())));
    const filteredParents = users.filter(user => user.role === 'parent' && (!parentSearch || user.email.toLowerCase().includes(parentSearch.toLowerCase())));
    const filteredTeachers = users.filter(user => user.role === 'teacher' && (!teacherSearch || user.email.toLowerCase().includes(teacherSearch.toLowerCase())));
    const filteredPendingTeachers = pendingTeachers.filter(teacher => !pendingTeacherSearch || teacher.email.toLowerCase().includes(pendingTeacherSearch.toLowerCase()));

    return (<>
            <Header/>
                <main className="flex-grow container mx-auto my-8 px-4">
                    <h1 className="text-4xl font-bold text-[#385469] mb-6">Quản lý người dùng</h1>
                    {message && <div className="bg-green-100 text-green-800 p-4 rounded mb-4">{message}</div>}
                    {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{error}</div>}
                    <button
                        onClick={openAddModal}
                        className="bg-[#f39f5f] text-white px-4 py-2 rounded hover:bg-[#e88f4f] transition mb-6"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2"/> Thêm người dùng
                    </button>

                    {/* Admin Table */}
                    <h2 className="text-3xl font-bold text-[#385469] my-8">Danh sách Admin</h2>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm bằng email..."
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.userTable}>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên đăng nhập</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Họ tên</th>
                                <th>Ngày sinh</th>
                                <th>Trạng thái</th>
                                <th>Xác minh</th>
                                <th>Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAdmins.length === 0 ? (<tr>
                                <td colSpan="9" className="text-center py-4">Không có admin nào.</td>
                            </tr>) : (filteredAdmins.map(user => (<tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email || '-'}</td>
                                <td>{user.phoneNumber || '-'}</td>
                                <td>{user.fullName || '-'}</td>
                                <td>{user.dateOfBirth || '-'}</td>
                                <td>{user.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                                <td>{user.verified ? 'Đã xác minh' : 'Chưa xác minh'}</td>
                                <td>
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-[#385469] hover:text-[#f39f5f] mr-2"
                                    >
                                        <FontAwesomeIcon icon={faEdit}/>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-[#dc3545] hover:text-[#b02a37]"
                                    >
                                        <FontAwesomeIcon icon={faTrash}/>
                                    </button>
                                </td>
                            </tr>)))}
                            </tbody>
                        </table>
                    </div>

                    {/* Parent Table */}
                    <h2 className="text-3xl font-bold text-[#385469] my-8">Danh sách Phụ huynh</h2>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm bằng email..."
                            value={parentSearch}
                            onChange={(e) => setParentSearch(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.userTable}>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên đăng nhập</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Họ tên</th>
                                <th>Ngày sinh</th>
                                <th>Trạng thái</th>
                                <th>Xác minh</th>
                                <th>Số lượng con</th>
                                <th>Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredParents.length === 0 ? (<tr>
                                <td colSpan="10" className="text-center py-4">Không có phụ huynh nào.</td>
                            </tr>) : (filteredParents.map(parent => (<React.Fragment key={parent.id}>
                                <tr>
                                    <td>{parent.id}</td>
                                    <td>{parent.username}</td>
                                    <td>{parent.email || '-'}</td>
                                    <td>{parent.phoneNumber || '-'}</td>
                                    <td>{parent.fullName || '-'}</td>
                                    <td>{parent.dateOfBirth || '-'}</td>
                                    <td>{parent.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                                    <td>{parent.verified ? 'Đã xác minh' : 'Chưa xác minh'}</td>
                                    <td>
                                        {parentChildCounts[parent.id] > 0 ? (<button
                                            onClick={() => toggleParentChildren(parent.id, parent.email)}
                                            className="text-[#385469] hover:text-[#f39f5f] flex items-center"
                                        >
                                            <FontAwesomeIcon icon={faUsers} className="mr-1"/>
                                            <span>({parentChildCounts[parent.id]})</span>
                                        </button>) : (<span>-</span>)}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(parent)}
                                            className="text-[#385469] hover:text-[#f39f5f] mr-2"
                                        >
                                            <FontAwesomeIcon icon={faEdit}/>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(parent.id)}
                                            className="text-[#dc3545] hover:text-[#b02a37]"
                                        >
                                            <FontAwesomeIcon icon={faTrash}/>
                                        </button>
                                    </td>
                                </tr>
                                {expandedParents[parent.id] && (<tr className="bg-gray-100">
                                    <td colSpan="10">
                                        <div className="pl-8 py-4">
                                            <h3 className="text-lg font-semibold text-[#385469] mb-2">Danh sách
                                                con cái</h3>
                                            <div className={styles.tableContainer}>
                                                <table className={styles.userTable}>
                                                    <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Tên đăng nhập</th>
                                                        <th>Email</th>
                                                        <th>Số điện thoại</th>
                                                        <th>Họ tên</th>
                                                        <th>Ngày sinh</th>
                                                        <th>Trạng thái</th>
                                                        <th>Xác minh</th>
                                                        <th>Hành động</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {childrenData[parent.id] ? (childrenData[parent.id].length > 0 ? (childrenData[parent.id].map(child => (
                                                        <tr key={child.id}>
                                                            <td>{child.id}</td>
                                                            <td>{child.username}</td>
                                                            <td>{child.email || '-'}</td>
                                                            <td>{child.phoneNumber || '-'}</td>
                                                            <td>{child.fullName || '-'}</td>
                                                            <td>{child.dateOfBirth || '-'}</td>
                                                            <td>{child.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                                                            <td>{child.verified ? 'Đã xác minh' : 'Chưa xác minh'}</td>
                                                            <td>
                                                                <button
                                                                    onClick={() => handleEdit(child)}
                                                                    className="text-[#385469] hover:text-[#f39f5f] mr-2"
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit}/>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(child.id)}
                                                                    className="text-[#dc3545] hover:text-[#b02a37]"
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash}/>
                                                                </button>
                                                            </td>
                                                        </tr>))) : (<tr>
                                                        <td colSpan="9"
                                                            className="text-center py-4">Không có con
                                                            cái.
                                                        </td>
                                                    </tr>)) : (<tr>
                                                        <td colSpan="9" className="text-center py-4">Đang
                                                            tải...
                                                        </td>
                                                    </tr>)}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>)}
                            </React.Fragment>)))}
                            </tbody>
                        </table>
                    </div>

                    {/* Teacher Table */}
                    <h2 className="text-3xl font-bold text-[#385469] my-8">Danh sách Giáo viên</h2>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm bằng email..."
                            value={teacherSearch}
                            onChange={(e) => setTeacherSearch(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.userTable}>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên đăng nhập</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Họ tên</th>
                                <th>Ngày sinh</th>
                                <th>Trạng thái</th>
                                <th>Xác minh</th>
                                <th>Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTeachers.length === 0 ? (<tr>
                                <td colSpan="9" className="text-center py-4">Không có giáo viên nào.</td>
                            </tr>) : (filteredTeachers.map(user => (<tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email || '-'}</td>
                                <td>{user.phoneNumber || '-'}</td>
                                <td>{user.fullName || '-'}</td>
                                <td>{user.dateOfBirth || '-'}</td>
                                <td>{user.isActive ? 'Hoạt động' : 'Không hoạt động'}</td>
                                <td>{user.verified ? 'Đã xác minh' : 'Chưa xác minh'}</td>
                                <td>
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-[#385469] hover:text-[#f39f5f] mr-2"
                                    >
                                        <FontAwesomeIcon icon={faEdit}/>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-[#dc3545] hover:text-[#b02a37]"
                                    >
                                        <FontAwesomeIcon icon={faTrash}/>
                                    </button>
                                </td>
                            </tr>)))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pending Teachers Table */}
                    <h2 className="text-3xl font-bold text-[#385469] my-8">Danh sách Giáo viên chờ duyệt</h2>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm bằng email..."
                            value={pendingTeacherSearch}
                            onChange={(e) => setPendingTeacherSearch(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.userTable}>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên đăng nhập</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Thông tin</th>
                                <th>Hành động</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredPendingTeachers.length === 0 ? (<tr>
                                <td colSpan="6" className="text-center py-4">Không có giáo viên chờ duyệt.</td>
                            </tr>) : (filteredPendingTeachers.map(teacher => (<tr key={teacher.id}>
                                <td>{teacher.id}</td>
                                <td>{teacher.username}</td>
                                <td>{teacher.email}</td>
                                <td>{teacher.phoneNumber || '-'}</td>
                                <td>
                                    <button
                                        onClick={() => handleViewTeacherInfo(teacher.email)}
                                        className="text-[#385469] hover:text-[#f39f5f] flex items-center"
                                    >
                                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1"/> Xem thông tin
                                    </button>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleApproveTeacher(teacher.id)}
                                        className="text-green-600 hover:text-green-800 mr-2"
                                    >
                                        <FontAwesomeIcon icon={faCheck}/>
                                    </button>
                                    <button
                                        onClick={() => handleRejectTeacher(teacher.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <FontAwesomeIcon icon={faBan}/>
                                    </button>
                                </td>
                            </tr>)))}
                            </tbody>
                        </table>
                    </div>

                    {/* Modal for Add/Edit User */}
                    {showModal && (<div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-[#385469]">
                                    {isEditing ? 'Cập nhật người dùng' : 'Thêm người dùng'}
                                </h2>
                                <button onClick={() => setShowModal(false)}
                                        className="text-[#385469] hover:text-[#f39f5f]">
                                    <FontAwesomeIcon icon={faTimes} size="lg"/>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="text"
                                            name="username"
                                            className={styles.input}
                                            value={currentUser.username}
                                            onChange={handleInputChange}
                                            required
                                            placeholder=" "
                                        />
                                        <label className={styles.label}>Tên đăng nhập</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>
                                {!isEditing && (<div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="password"
                                            name="password"
                                            className={styles.input}
                                            value={currentUser.password}
                                            onChange={handleInputChange}
                                            required
                                            placeholder=" "
                                        />
                                        <label className={styles.label}>Mật khẩu</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>)}
                                {currentUser.role !== 'child' && (<div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="email"
                                            name="email"
                                            className={styles.input}
                                            value={currentUser.email}
                                            onChange={handleInputChange}
                                            placeholder=" "
                                        />
                                        <label className={styles.label}>Email</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>)}
                                {!isEditing && currentUser.role === 'child' && (<div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="email"
                                            name="parentEmail"
                                            className={styles.input}
                                            value={currentUser.parentEmail}
                                            onChange={handleInputChange}
                                            required
                                            placeholder=" "
                                        />
                                        <label className={styles.label}>Email phụ huynh</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>)}
                                <div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <select
                                            name="role"
                                            className={styles.input}
                                            value={currentUser.role}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="child">Học sinh</option>
                                            <option value="parent">Phụ huynh</option>
                                            <option value="teacher">Giáo viên</option>
                                            <option value="admin">Quản trị viên</option>
                                        </select>
                                        <label className={styles.label}>Vai trò</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>
                                {(currentUser.role === 'parent' || currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                                    <div className={styles.formGroup}>
                                        <div className={styles.inputContainer}>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                className={styles.input}
                                                value={currentUser.phoneNumber}
                                                onChange={handleInputChange}
                                                placeholder=" "
                                            />
                                            <label className={styles.label}>Số điện thoại</label>
                                            <span className={styles.notch}></span>
                                        </div>
                                    </div>)}
                                <div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="text"
                                            name="fullName"
                                            className={styles.input}
                                            value={currentUser.fullName}
                                            onChange={handleInputChange}
                                            placeholder=" "
                                        />
                                        <label className={styles.label}>Họ tên</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <div className={styles.inputContainer}>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            className={styles.input}
                                            value={currentUser.dateOfBirth}
                                            onChange={handleInputChange}
                                            placeholder=" "
                                        />
                                        <label className={styles.label}>Ngày sinh</label>
                                        <span className={styles.notch}></span>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            className="mr-2"
                                            checked={currentUser.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <span className="text-[#385469]">Hoạt động</span>
                                    </label>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="verified"
                                            className="mr-2"
                                            checked={currentUser.verified}
                                            onChange={handleInputChange}
                                        />
                                        <span className="text-[#385469]">Đã xác minh</span>
                                    </label>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="bg-[#385469] text-white px-4 py-2 rounded hover:bg-[#2a3f4e] transition mr-2"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-[#f39f5f] text-white px-4 py-2 rounded hover:bg-[#e88f4f] transition"
                                    >
                                        {isEditing ? 'Cập nhật' : 'Thêm'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>)}
                </main>
                <Footer/>
        </>);
};

export default Admin;
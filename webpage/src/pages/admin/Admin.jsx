import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/AdminAccounts.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faEdit,
    faInfoCircle,
    faPlus,
    faTimes,
    faTrash,
    faUsers,
    faUserTie,
    faUserGraduate,
    faChild,
    faUserShield
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
            setError(`Error loading user list: ${err.response?.data || err.message}`);
        }
    };

    const fetchPendingTeachers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/pending-teachers', {
                withCredentials: true,
            });
            setPendingTeachers(response.data);
        } catch (err) {
            setError(`Error loading pending teachers: ${err.response?.data || err.message}`);
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
            setError(`Error loading children: ${err.response?.data || err.message}`);
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
                setMessage('User updated successfully!');
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
                setMessage(response.data || 'User added successfully!');
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
            setError(err.response?.data || 'Error saving user.');
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
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
                    withCredentials: true,
                });
                setMessage(response.data || 'User deleted successfully!');
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
                setError(err.response?.data || 'Error deleting user.');
            }
        }
    };

    const handleApproveTeacher = async (id) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/admin/approve-teacher/${id}`, {}, {
                withCredentials: true,
            });
            setMessage(response.data || 'Teacher approved successfully!');
            fetchPendingTeachers();
            fetchUsers();
        } catch (err) {
            setError(err.response?.data || 'Error approving teacher.');
        }
    };

    const handleRejectTeacher = async (id) => {
        if (window.confirm('Are you sure you want to reject this teacher?')) {
            try {
                const response = await axios.post(`http://localhost:8080/api/admin/reject-teacher/${id}`, {}, {
                    withCredentials: true,
                });
                setMessage(response.data || 'Teacher rejected successfully!');
                fetchPendingTeachers();
            } catch (err) {
                setError(err.response?.data || 'Error rejecting teacher.');
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
                <main className={styles.container}>
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <h1 className={styles.headerTitle}>Quản lý người dùng</h1>
                            <p className={styles.headerDescription}>Quản lý tài khoản người dùng trong hệ thống Hocho</p>
                        </div>
                        <div className={styles.headerIcon}>
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                    </div>

                    {message && <div className={styles.successMessage}>{message}</div>}
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <div className={styles.buttonContainer}>
                        <button
                            onClick={openAddModal}
                            className={`${styles.button} ${styles.primaryButton}`}
                        >
                            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '0.5rem' }}/> Thêm người dùng
                        </button>
                    </div>

                    {/* Admin Table */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FontAwesomeIcon icon={faUserShield} className={styles.sectionIcon} />
                            <h2 className={styles.sectionTitle}>Danh sách Admin</h2>
                        </div>
                        <div className={styles.sectionContent}>
                            <div className={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bằng email..."
                                    value={adminSearch}
                                    onChange={(e) => setAdminSearch(e.target.value)}
                                    className={styles.searchInput}
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
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>Không có admin nào.</td>
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
                                                className={`${styles.iconButton} ${styles.editButton}`}
                                                style={{ marginRight: '0.5rem' }}
                                            >
                                                <FontAwesomeIcon icon={faEdit}/>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className={`${styles.iconButton} ${styles.deleteButton}`}
                                            >
                                                <FontAwesomeIcon icon={faTrash}/>
                                            </button>
                                        </td>
                                    </tr>)))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Parent Table */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FontAwesomeIcon icon={faUsers} className={styles.sectionIcon} />
                            <h2 className={styles.sectionTitle}>Danh sách Phụ huynh</h2>
                        </div>
                        <div className={styles.sectionContent}>
                            <div className={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bằng email..."
                                    value={parentSearch}
                                    onChange={(e) => setParentSearch(e.target.value)}
                                    className={styles.searchInput}
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
                                        <td colSpan="10" style={{ textAlign: 'center', padding: '1rem' }}>Không có phụ huynh nào.</td>
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
                                                {parentChildCounts[parent.id] > 0 ? (
                                                    <button
                                                        onClick={() => toggleParentChildren(parent.id, parent.email)}
                                                        className={`${styles.iconButton} ${styles.editButton}`}
                                                        style={{ display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <FontAwesomeIcon icon={faUsers} style={{ marginRight: '0.25rem' }}/>
                                                        <span>({parentChildCounts[parent.id]})</span>
                                                    </button>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleEdit(parent)}
                                                    className={`${styles.iconButton} ${styles.editButton}`}
                                                    style={{ marginRight: '0.5rem' }}
                                                >
                                                    <FontAwesomeIcon icon={faEdit}/>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(parent.id)}
                                                    className={`${styles.iconButton} ${styles.deleteButton}`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash}/>
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedParents[parent.id] && (
                                            <tr className={styles.childRow}>
                                                <td colSpan="10">
                                                    <div className={styles.childContainer}>
                                                        <h3 className={styles.childTableTitle}>Danh sách con cái</h3>
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
                                                                {childrenData[parent.id] ? (
                                                                    childrenData[parent.id].length > 0 ? (
                                                                        childrenData[parent.id].map(child => (
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
                                                                                        className={`${styles.iconButton} ${styles.editButton}`}
                                                                                        style={{ marginRight: '0.5rem' }}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faEdit}/>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDelete(child.id)}
                                                                                        className={`${styles.iconButton} ${styles.deleteButton}`}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faTrash}/>
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>
                                                                                Không có con cái.
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>
                                                                            Đang tải...
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>)))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Teacher Table */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FontAwesomeIcon icon={faUserTie} className={styles.sectionIcon} />
                            <h2 className={styles.sectionTitle}>Danh sách Giáo viên</h2>
                        </div>
                        <div className={styles.sectionContent}>
                            <div className={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bằng email..."
                                    value={teacherSearch}
                                    onChange={(e) => setTeacherSearch(e.target.value)}
                                    className={styles.searchInput}
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
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>Không có giáo viên nào.</td>
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
                                                className={`${styles.iconButton} ${styles.editButton}`}
                                                style={{ marginRight: '0.5rem' }}
                                            >
                                                <FontAwesomeIcon icon={faEdit}/>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className={`${styles.iconButton} ${styles.deleteButton}`}
                                            >
                                                <FontAwesomeIcon icon={faTrash}/>
                                            </button>
                                        </td>
                                    </tr>)))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Pending Teachers Table */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FontAwesomeIcon icon={faUserGraduate} className={styles.sectionIcon} />
                            <h2 className={styles.sectionTitle}>Danh sách Giáo viên chờ duyệt</h2>
                        </div>
                        <div className={styles.sectionContent}>
                            <div className={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bằng email..."
                                    value={pendingTeacherSearch}
                                    onChange={(e) => setPendingTeacherSearch(e.target.value)}
                                    className={styles.searchInput}
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
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>Không có giáo viên chờ duyệt.</td>
                                    </tr>) : (filteredPendingTeachers.map(teacher => (<tr key={teacher.id}>
                                        <td>{teacher.id}</td>
                                        <td>{teacher.username}</td>
                                        <td>{teacher.email}</td>
                                        <td>{teacher.phoneNumber || '-'}</td>
                                        <td>
                                            <button
                                                onClick={() => handleViewTeacherInfo(teacher.email)}
                                                className={`${styles.iconButton} ${styles.editButton}`}
                                                style={{ display: 'flex', alignItems: 'center' }}
                                            >
                                                <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '0.25rem' }}/> Xem thông tin
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleApproveTeacher(teacher.id)}
                                                className={`${styles.iconButton} ${styles.approveButton}`}
                                                style={{ marginRight: '0.5rem' }}
                                            >
                                                <FontAwesomeIcon icon={faCheck}/>
                                            </button>
                                            <button
                                                onClick={() => handleRejectTeacher(teacher.id)}
                                                className={`${styles.iconButton} ${styles.rejectButton}`}
                                            >
                                                <FontAwesomeIcon icon={faBan}/>
                                            </button>
                                        </td>
                                    </tr>)))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Modal for Add/Edit User */}
                    {showModal && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <div className={styles.modalHeader}>
                                    <h2 className={styles.modalTitle}>
                                        {isEditing ? 'Cập nhật người dùng' : 'Thêm người dùng'}
                                    </h2>
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className={styles.modalCloseButton}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
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
                                    {!isEditing && (
                                        <div className={styles.formGroup}>
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
                                        </div>
                                    )}
                                    {currentUser.role !== 'child' && (
                                        <div className={styles.formGroup}>
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
                                        </div>
                                    )}
                                    {!isEditing && currentUser.role === 'child' && (
                                        <div className={styles.formGroup}>
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
                                        </div>
                                    )}
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
                                        </div>
                                    )}
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
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                className={styles.checkbox}
                                                checked={currentUser.isActive}
                                                onChange={handleInputChange}
                                            />
                                            <span>Hoạt động</span>
                                        </label>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                name="verified"
                                                className={styles.checkbox}
                                                checked={currentUser.verified}
                                                onChange={handleInputChange}
                                            />
                                            <span>Đã xác minh</span>
                                        </label>
                                    </div>
                                    <div className={styles.modalFooter}>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className={`${styles.button} ${styles.secondaryButton}`}
                                            style={{ marginRight: '0.5rem' }}
                                        >
                                            Đóng
                                        </button>
                                        <button
                                            type="submit"
                                            className={`${styles.button} ${styles.primaryButton}`}
                                        >
                                            {isEditing ? 'Cập nhật' : 'Thêm'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
                <Footer/>
        </>);
};

export default Admin;

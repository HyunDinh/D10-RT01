import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/ParentDashboard.module.css';
import Header from '../../components/Header.jsx';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';

const ParentLearningMonitor = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAge, setFilterAge] = useState('');
    const [filterGrade, setFilterGrade] = useState('');

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            // Lấy parentId từ API profile
            const userResponse = await axios.get('/api/hocho/profile', {withCredentials: true});
            const parentId = userResponse.data.id;
            // Gọi API lấy danh sách con theo parentId
            const response = await axios.get(`/api/parent/children/${parentId}`);
            setChildren(response.data);
            setError(null);
        } catch (err) {
            setError('Cannot load children list');
            console.error('Error fetching children:', err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy avatar
    const getChildAvatarUrl = (child) => {
        const baseUrl = 'http://localhost:8080';
        if (!child.avatarUrl || child.avatarUrl === 'none') {
            return `/default.jpg?t=${new Date().getTime()}`;
        }
        return `${baseUrl}/api/hocho/profile/${child.avatarUrl}?t=${new Date().getTime()}`;
    };

    const filteredChildren = children.filter((child) => {
        const fullName = child.fullName || '';
        const matchesName = typeof fullName === 'string' && fullName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAge = filterAge ? child.age === parseInt(filterAge) : true;
        const matchesGrade = filterGrade ? child.grade === parseInt(filterGrade) : true;
        return matchesName && matchesAge && matchesGrade;
    });

    if (loading) {
        return (<div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>);
    }

    if (error) {
        return (<div className={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={fetchChildren} className={styles.retryButton}>
                    Retry
                </button>
            </div>);
    }

    return (<>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>Monitor your child's learning progress</p>
                    <ul className={styles.breadcrumbItems}
                        data-aos-duration="800"
                        data-aos-once="true"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>Monitor</li>
                    </ul>
                </div>
            </section>
            <div className={styles.container}>
                <div className={styles.header}>
                    <p>Select a child to view detailed learning progress</p>
                </div>

                <div className={styles.main}>
                    {/* Search Sidebar */}
                    <div className={styles.sidebar}>
                        <h2>Search Children</h2>
                        <div className={styles.searchForm}>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                                aria-label="Search children by name"
                            />
                            <div className={styles.filterGroup}>
                                <label htmlFor="ageFilter">Age:</label>
                                <select
                                    id="ageFilter"
                                    value={filterAge}
                                    onChange={(e) => setFilterAge(e.target.value)}
                                    className={styles.filterSelect}
                                    aria-label="Filter by age"
                                >
                                    <option value="">All Ages</option>
                                    {[...Array(18).keys()].map((age) => (<option key={age + 1} value={age + 1}>
                                            {age + 1} years
                                        </option>))}
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label htmlFor="gradeFilter">Grade:</label>
                                <select
                                    id="gradeFilter"
                                    value={filterGrade}
                                    onChange={(e) => setFilterGrade(e.target.value)}
                                    className={styles.filterSelect}
                                    aria-label="Filter by grade"
                                >
                                    <option value="">All Grades</option>
                                    {[...Array(12).keys()].map((grade) => (<option key={grade + 1} value={grade + 1}>
                                            Grade {grade + 1}
                                        </option>))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Children List */}
                    <div className={styles.content}>
                        <div className={styles.section}>
                            <h2>Children List</h2>
                            {filteredChildren.length > 0 ? (<div className={styles.childrenGrid}>
                                    {filteredChildren.map((child) => (<div key={child.id} className={styles.childCard}>
                                            <div className={styles.childAvatar}>
                                                <img
                                                    src={getChildAvatarUrl(child)}
                                                    alt={child.fullName}
                                                    onError={(e) => (e.target.src = '/default.jpg')}
                                                />
                                            </div>
                                            <div className={styles.childInfo}>
                                                <h3>{child.fullName}</h3>
                                                <p>{child.email}</p>
                                                <div className={styles.childStats}>
                                                    <span>{child.age ? `${child.age} years old` : ''}</span>
                                                    <span>{child.grade ? `Grade ${child.grade}` : ''}</span>
                                                </div>
                                            </div>
                                            <div className={styles.childActions}>
                                                <Link
                                                    to={`/hocho/parent/learning-progress/${child.id}`}
                                                    className={styles.progressButton}
                                                    aria-label={`View learning progress for ${child.fullName}`}
                                                >
                                                    View learning progress
                                                </Link>
                                            </div>
                                        </div>))}
                                </div>) : (<div className={styles.noChildren}>
                                    <p>
                                        {searchQuery || filterAge || filterGrade ? 'No children match your search criteria.' : 'You have not registered any children yet.'}
                                    </p>
                                    <Link to="/hocho/register-child" className={styles.addChildButton}>
                                        Register child
                                    </Link>
                                </div>)}
                        </div>
                    </div>
                </div>
            </div>
        </>);
};

export default ParentLearningMonitor;
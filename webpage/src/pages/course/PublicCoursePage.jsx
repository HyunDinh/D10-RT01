import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import styles from '../../styles/course/CoursePublic.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCaretDown, faCartPlus, faChevronRight, faSearch} from '@fortawesome/free-solid-svg-icons';
import {useNavigate} from 'react-router-dom';

const CoursesList = () => {
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [user, setUser] = useState(null);
    const [childId, setChildId] = useState(null);
    const [children, setChildren] = useState([]);
    const [loadingStates, setLoadingStates] = useState({}); // State to track loading for each course
    const [error, setError] = useState(null);
    const coursesPerPage = 6;
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: '',
        priceRange: '',
        level: '',
        search: '',
    });
    const [showChildModal, setShowChildModal] = useState(false);
    const [pendingCourseId, setPendingCourseId] = useState(null);
    const [hoveredTeacherCard, setHoveredTeacherCard] = useState(null);

    const getCourseImageUrl = (courseImageUrl) => {
        const baseUrl = 'http://localhost:8080';
        if (!courseImageUrl || courseImageUrl === 'none') {
            return '/avaBack.jpg';
        }
        // Extract filename from courseImageUrl (e.g., "/course/filename.jpg" -> "filename.jpg")
        const fileName = courseImageUrl.split('/').pop();
        return `${baseUrl}/api/courses/image/${fileName}?t=${new Date().getTime()}`;
    };

    useEffect(() => {
        const initializeData = async () => {
            try {
                // Lấy thông tin người dùng
                const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                    withCredentials: true,
                });
                setUser(userResponse.data);
                console.log('USER:', userResponse.data);

                if (userResponse.data.role && userResponse.data.role.toLowerCase() === 'parent') {
                    const childrenResponse = await axios.get('http://localhost:8080/api/hocho/children', {
                        withCredentials: true,
                    });
                    setChildren(childrenResponse.data);
                    console.log('CHILDREN:', childrenResponse.data);
                    if (childrenResponse.data.length > 0) {
                        setChildId(childrenResponse.data[0].id);
                    }
                }

                await fetchCourses();
            } catch (err) {
                console.error('Failed to initialize data:', err);
                setError('Cannot load data. Please log in again.');
                if (err.response?.status === 401) {
                    navigate('/hocho/login?redirect=course-list');
                }
            }
        };

        initializeData();
    }, []);

    const fetchCourses = async () => {
        try {
            let url = 'http://localhost:8080/api/courses';
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.priceRange) params.priceRange = filters.priceRange;
            if (filters.level) params.level = filters.level;
            if (filters.search) params.search = filters.search;

            const response = await axios.get(url, {params, withCredentials: true});
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setError('Cannot load course list.');
        }
    };

    const handleAddToCart = async (courseId) => {
        if (user.role && user.role.toLowerCase() === 'parent') {
            setPendingCourseId(courseId);
            setShowChildModal(true);
            return;
        }
        if (!user) {
            alert('Please log in to add to cart!');
            navigate('/hocho/login?redirect=course-list');
            return;
        }
        try {
            if (user.role && user.role.toLowerCase() === 'child') {
                const res = await axios.post(
                    `/api/child-cart/${user.id}/add/${courseId}`,
                    {},
                    {withCredentials: true}
                );
                alert('Course added to cart!');
                navigate('/hocho/child/cart');
            } else if (user.role === "parent") {
                if (!childId) {
                    alert('Please select a child to add the course!');
                    setLoadingStates((prev) => ({...prev, [courseId]: false}));
                    return;
                }
                await axios.post(
                    `http://localhost:8080/api/parent-cart/${user.id}/add-course/${childId}/${courseId}`,
                    {},
                    {withCredentials: true}
                );
                alert('Course added to cart!');
                navigate('/hocho/parent/cart');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Cannot add course to cart!';
            alert(errorMessage);
            console.error('Failed to add to cart:', error, error.response);
        }
    };

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

    const totalPages = Math.ceil(courses.length / coursesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCourses();
    };

    const handleChildChange = (e) => {
        setChildId(Number(e.target.value));
    };

    useEffect(() => {
        // Không fetch khi chỉ thay đổi search text
        fetchCourses();
        setCurrentPage(1);
        // eslint-disable-next-line
    }, [filters.category, filters.priceRange, filters.level]);

    return (
        <>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>Course List</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>Course List</li>
                    </ul>
                </div>
            </section>
            <h2 className={styles.title}>List all courses</h2>
            {error && <div className="alert alert-danger text-center">{error}</div>}
            <div className={styles.mainContainer}>
                <aside className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>Search</h3>
                    <div className={styles.filterGroup}>
                        <form onSubmit={handleSearch} className={styles.searchForm}>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search courses..."
                                className={styles.searchInput}
                            />
                            <button type="submit" className={styles.searchBtn}>
                                <FontAwesomeIcon icon={faSearch}/>
                            </button>
                        </form>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Age</label>
                        <div className={styles.filterWrapper}>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className={styles.filterSelect}
                            >
                                <option value="">All age</option>
                                <option value="4-6">4-6 years old</option>
                                <option value="7-9">7-9 years old</option>
                                <option value="10-12">10-12 years old</option>
                                <option value="13-15">13-15 years old</option>
                            </select>
                            <span className={styles.dropdownIcon}>
                <FontAwesomeIcon icon={faCaretDown}/>
              </span>
                        </div>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Price Range</label>
                        <div className={styles.filterWrapper}>
                            <select
                                name="priceRange"
                                value={filters.priceRange}
                                onChange={handleFilterChange}
                                className={styles.filterSelect}
                            >
                                <option value="">All</option>
                                <option value="0-500000">0 - 500,000 VND</option>
                                <option value="500000-1000000">500,000 - 1,000,000 VND</option>
                                <option value="1000000+">1,000,000+ VND</option>
                            </select>
                            <span className={styles.dropdownIcon}>
                <FontAwesomeIcon icon={faCaretDown}/>
              </span>
                        </div>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Subject</label>
                        <div className={styles.filterWrapper}>
                            <select
                                name="level"
                                value={filters.level}
                                onChange={handleFilterChange}
                                className={styles.filterSelect}
                            >
                                <option value="">All subject</option>
                                <option value="MATHEMATICS">Mathematics</option>
                                <option value="LITERATURE">Literature</option>
                                <option value="ENGLISH">English</option>
                                <option value="PHYSICS">Physics</option>
                                <option value="CHEMISTRY">Chemistry</option>
                                <option value="BIOLOGY">Biology</option>
                                <option value="HISTORY">History</option>
                                <option value="GEOGRAPHY">Geography</option>
                                <option value="CIVICS">Civics</option>
                                <option value="PHYSICAL_EDUCATION">Physical Education</option>
                                <option value="TECHNOLOGY">Technology</option>
                            </select>
                            <span className={styles.dropdownIcon}>
                <FontAwesomeIcon icon={faCaretDown}/>
              </span>
                        </div>
                    </div>
                    {user && user.role && user.role.toLowerCase() === 'parent' && children.length > 0 && (
                        <div className={styles.filterGroup}>
                            <label>Select child</label>
                            <div className={styles.filterWrapper}>
                                <select
                                    value={childId || ''}
                                    onChange={handleChildChange}
                                    className={styles.filterSelect}
                                >
                                    <option value="">Select child</option>
                                    {children.map((child) => (
                                        <option key={child.id} value={child.id}>
                                            {child.fullName || child.username}
                                        </option>
                                    ))}
                                </select>
                                <span className={styles.dropdownIcon}>
                  <FontAwesomeIcon icon={faCaretDown}/>
                </span>
                            </div>
                        </div>
                    )}
                    <button
                        className={styles.clearBtn}
                        onClick={() => setFilters({category: '', priceRange: '', level: '', search: ''})}
                    >
                        Clear Filters
                    </button>
                </aside>
                <div className={styles.courseSection}>
                    <div className={currentCourses.length <= 3 ? styles.courseGridSingle : styles.courseGrid}>
                        {currentCourses.map((course, idx) => (
                            <div key={course.courseId || idx} className={styles.courseCard}>
                                <div className={styles.cardImage}>
                                    <img
                                        src={getCourseImageUrl(course.courseImageUrl)}
                                        alt={course.title}
                                        className={styles.courseImg}
                                        onError={(e) => (e.target.src = '/images/default-course.jpg')}
                                    />
                                </div>
                                <div className={styles.cardBody}>
                                    <h5 className={styles.cardTitle}>{course.title}</h5>
                                    <p className={styles.cardText}>
                                        <b>Description</b> {course.description.substring(0, 100)}...
                                    </p>
                                    <p className={styles.cardText}>
                                        <b>Price:</b> {course.price.toLocaleString('vi-VN')} VND
                                    </p>
                                    <p className={styles.cardText}>
                                        <b>Subject:</b>{' '}
                                        {course.subject ? course.subject.replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'N/A'}
                                    </p>
                                    {/* Avatar + tên giáo viên + nút nhắn tin khi hover avatar/tên/nút */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            margin: '8px 0',
                                            position: 'relative',
                                            minHeight: 60,
                                            padding: '4px 0',
                                            zIndex: 1,
                                        }}
                                        onMouseEnter={() => setHoveredTeacherCard(course.courseId)}
                                        onMouseLeave={() => setHoveredTeacherCard(null)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={
                                                    course.teacherAvatarUrl
                                                        ? `http://localhost:8080/api/hocho/profile/${course.teacherAvatarUrl}`
                                                        : '/images/default-avatar.png'
                                                }
                                                alt={course.teacherName}
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    marginRight: 8,
                                                    border: '1px solid #eee',
                                                    cursor: 'pointer',
                                                }}
                                                onError={(e) => {
                                                    e.target.src = '/images/default-avatar.png';
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: '#2d6cdf',
                                                    fontSize: '1rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
              {course.teacherName}
            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'end' }}>
                                        <button
                                            className={styles.detailsBtn}
                                            onClick={() => navigate(`/hocho/course-detail/${course.courseId}`)}
                                        >
                                            Details
                                        </button>
                                        <button
                                            className={`${styles.detailsBtn} ${styles.addToCartBtn}`}
                                            onClick={() => {
                                                handleAddToCart(course.courseId);
                                            }}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            <FontAwesomeIcon icon={faCartPlus} /> Add to cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <nav className={styles.paginationNav}>
                        <ul className={styles.pagination}>
                            {[...Array(totalPages).keys()].map((page) => (
                                <li
                                    key={page}
                                    className={`${styles.pageItem} ${currentPage === page + 1 ? styles.active : ''}`}
                                    onClick={() => paginate(page + 1)}
                                >
                                    <button className={styles.pageLink}>{page + 1}</button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

            </div>
            {/* Modal select child for parent */}
            {showChildModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.3)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{background: '#fff', padding: 32, borderRadius: 8, minWidth: 320}}>
                        <h4>Select child to add course</h4>
                        <select
                            id="child-select"
                            value={childId || ''}
                            onChange={handleChildChange}
                            style={{width: '100%', padding: 8, margin: '16px 0'}}
                        >
                            <option value="">Select child</option>
                            {children.map((child) => (
                                <option key={child.id} value={child.id}>
                                    {child.fullName || child.username}
                                </option>
                            ))}
                        </select>
                        <div style={{marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8}}>
                            <button
                                className={styles.detailsBtn}
                                onClick={() => {
                                    setShowChildModal(false);
                                    // Lấy childId trực tiếp từ DOM để chắc chắn là giá trị mới nhất
                                    const selectedChildId = Number(document.getElementById('child-select').value);
                                    if (pendingCourseId && selectedChildId) {
                                        axios.post(
                                            `/api/parent-cart/${user.id}/add-course/${selectedChildId}/${pendingCourseId}`,
                                            {},
                                            {withCredentials: true}
                                        ).then(() => {
                                            alert('Course added to cart!');
                                            navigate('/hocho/parent/cart');
                                        }).catch(error => {
                                            let errorMessage = error.response?.data?.message || 'Cannot add course to cart!';
                                            if (errorMessage.includes('has been registered')) {
                                                errorMessage = 'Child has already joined this course!';
                                            }
                                            alert(errorMessage);
                                        }).finally(() => {
                                            setPendingCourseId(null);
                                        });
                                    } else {
                                        alert('Please select a child!');
                                        setPendingCourseId(null);
                                    }
                                }}
                                disabled={!childId}
                            >
                                Confirm
                            </button>
                            <button
                                className={styles.detailsBtn}
                                onClick={() => {
                                    setShowChildModal(false);
                                    setPendingCourseId(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CoursesList;
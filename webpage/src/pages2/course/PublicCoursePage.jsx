import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import styles from '../../styles/course/CoursePublic.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCartPlus, faChevronRight, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const CoursesList = () => {
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [user, setUser] = useState(null);
    const [childId, setChildId] = useState(null);
    const [children, setChildren] = useState([]);
    const [loadingStates, setLoadingStates] = useState({}); // State để theo dõi loading cho từng khóa học
    const [error, setError] = useState(null);
    const coursesPerPage = 12;
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: '',
        priceRange: '',
        level: '',
        search: '',
    });

    useEffect(() => {
        const initializeData = async () => {
            try {
                // Lấy thông tin người dùng
                const userResponse = await axios.get('http://localhost:8080/api/hocho/profile', {
                    withCredentials: true,
                });
                setUser(userResponse.data);

                if (userResponse.data.role === 'PARENT') {
                    const childrenResponse = await axios.get('http://localhost:8080/api/hocho/children', {
                        withCredentials: true,
                    });
                    setChildren(childrenResponse.data);
                    if (childrenResponse.data.length > 0) {
                        setChildId(childrenResponse.data[0].id);
                    }
                }

                await fetchCourses();
            } catch (err) {
                console.error('Failed to initialize data:', err);
                setError('Không thể tải dữ liệu. Vui lòng đăng nhập lại.');
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

            const response = await axios.get(url, { params, withCredentials: true });
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            setError('Không thể tải danh sách khóa học.');
        }
    };

    const handleAddToCart = async (courseId) => {
        if (!user) {
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            navigate('/hocho/login?redirect=course-list');
            return;
        }

        // Bật trạng thái loading cho khóa học cụ thể
        setLoadingStates((prev) => ({ ...prev, [courseId]: true }));

        try {
            if (user.role === 'child') {
                await axios.post(
                    `http://localhost:8080/api/child-cart/${user.id}/add/${courseId}`,
                    {},
                    { withCredentials: true }
                );
                alert('Đã thêm khóa học vào giỏ hàng!');
                navigate('/hocho/child/cart');
            } else if (user.role === "parent" ) {
                if (!childId) {
                    alert('Vui lòng chọn một đứa trẻ để thêm khóa học!');
                    setLoadingStates((prev) => ({ ...prev, [courseId]: false }));
                    return;
                }
                await axios.post(
                    `http://localhost:8080/api/parent-cart/${user.id}/add-course/${childId}/${courseId}`,
                    {},
                    { withCredentials: true }
                );
                alert('Đã thêm khóa học vào giỏ hàng!');
                navigate('/parent-cart');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể thêm khóa học vào giỏ hàng!';
            toast.error(errorMessage);
            console.error('Failed to add to cart:', error);
        } finally {
            // Tắt trạng thái loading
            setLoadingStates((prev) => ({ ...prev, [courseId]: false }));
        }
    };

    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

    const totalPages = Math.ceil(courses.length / coursesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
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
        setChildId(e.target.value);
    };

    return (
        <>
            <Header />
            <section className={styles.sectionHeader} style={{ backgroundImage: `url(/background.png)` }}>
                <div className={styles.headerInfo}>
                    <p>Course List</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
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
                                <FontAwesomeIcon icon={faSearch} />
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
                <FontAwesomeIcon icon={faCaretDown} />
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
                <FontAwesomeIcon icon={faCaretDown} />
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
                                <option value="Mathematics">Mathematics</option>
                                <option value="Literature">Literature</option>
                                <option value="English">English</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="History">History</option>
                                <option value="Geography">Geography</option>
                                <option value="Civics">Civics</option>
                                <option value="Physical Education">Physical Education</option>
                                <option value="Technology">Technology</option>
                            </select>
                            <span className={styles.dropdownIcon}>
                <FontAwesomeIcon icon={faCaretDown} />
              </span>
                        </div>
                    </div>
                    {user && user.role === 'PARENT' && children.length > 0 && (
                        <div className={styles.filterGroup}>
                            <label>Chọn trẻ em</label>
                            <div className={styles.filterWrapper}>
                                <select
                                    value={childId || ''}
                                    onChange={handleChildChange}
                                    className={styles.filterSelect}
                                >
                                    <option value="">Chọn trẻ em</option>
                                    {children.map((child) => (
                                        <option key={child.id} value={child.id}>
                                            {child.fullName}
                                        </option>
                                    ))}
                                </select>
                                <span className={styles.dropdownIcon}>
                  <FontAwesomeIcon icon={faCaretDown} />
                </span>
                            </div>
                        </div>
                    )}
                    <button
                        className={styles.clearBtn}
                        onClick={() => setFilters({ category: '', priceRange: '', level: '', search: '' })}
                    >
                        Clear Filters
                    </button>
                </aside>
                <div className={styles.courseSection}>
                    <div className={styles.courseGrid}>
                        {currentCourses.map((course) => (
                            <div key={course.id} className={styles.courseCard}>
                                <div className={styles.cardImage}>
                                    <img
                                        src={course.image || '/avaBack.jpg'}
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
                                        <b>Giá:</b> {course.price.toLocaleString('vi-VN')} VND
                                    </p>
                                    <div style={{ textAlign: 'end' }}>
                                        <button
                                            className={styles.detailsBtn}
                                            onClick={() => navigate(`/hocho/course-detail/${course.courseId}`)}
                                        >
                                            Details
                                        </button>
                                        <button
                                            className={`${styles.detailsBtn} ${styles.addToCartBtn}`}
                                            onClick={() => handleAddToCart(course.id)}
                                            disabled={loadingStates[course.id]}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            {loadingStates[course.id] ? (
                                                <>
                                                    <FontAwesomeIcon icon={faSpinner} spin /> Đang thêm...
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faCartPlus} /> Thêm vào giỏ
                                                </>
                                            )}
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
        </>
    );
};

export default CoursesList;
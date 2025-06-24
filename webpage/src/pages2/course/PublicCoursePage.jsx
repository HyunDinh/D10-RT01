import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import styles from "../../styles/course/CoursePublic.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretDown, faChevronRight, faSearch} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
// import './CoursesList.css'; // Optional, for styling if needed

const CoursesList = () => {
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 12;
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        category: '',
        priceRange: '',
        level: '',
        search: '',
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            let url = 'http://localhost:8080/api/courses';
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.priceRange) params.priceRange = filters.priceRange;
            if (filters.level) params.level = filters.level;
            if (filters.search) params.search = filters.search;

            const response = await axios.get(url, {params});
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
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
        setCurrentPage(1); // Reset về trang 1 khi lọc
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
        fetchCourses(); // Gọi lại API với giá trị search
    };

    return (<>
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
            <div className={styles.mainContainer}>
                {/* Sidebar Filter */}
                <aside className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>Search</h3>
                    {/* Search Bar */}
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
                            <select name="category" value={filters.category} onChange={handleFilterChange}
                                    className={styles.filterSelect}>
                                <option value="">All age</option>
                                <option value="Programming">4-6 years old</option>
                                <option value="Design">7-9 years old</option>
                                <option value="Marketing">10-12 years old</option>
                                <option value="Marketing">13-15 years old</option>
                            </select>
                            <span className={styles.dropdownIcon}><FontAwesomeIcon icon={faCaretDown}/></span>
                        </div>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Price Range</label>
                        <div className={styles.filterWrapper}>
                            <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange}
                                    className={styles.filterSelect}>
                                <option value="">All</option>
                                <option value="0-500000">0 - 500,000 VND</option>
                                <option value="500000-1000000">500,000 - 1,000,000 VND</option>
                                <option value="1000000+">1,000,000+ VND</option>
                            </select>
                            <span className={styles.dropdownIcon}><FontAwesomeIcon icon={faCaretDown}/></span>
                        </div>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Subject</label>
                        <div className={styles.filterWrapper}>
                            <select name="level" value={filters.level} onChange={handleFilterChange}
                                    className={styles.filterSelect}>
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
                            <span className={styles.dropdownIcon}><FontAwesomeIcon icon={faCaretDown}/></span>
                        </div>
                    </div>
                    <button className={styles.clearBtn}
                            onClick={() => setFilters({category: '', priceRange: '', level: '', search: ''})}>
                        Clear Filters
                    </button>
                </aside>
                {/* Course List */}
                <div className={styles.courseSection}>
                    <div className={styles.courseGrid}>
                        {currentCourses.map((course) => (
                            <div key={course.id} className={styles.courseCard}>
                                <div className={styles.cardImage}>
                                    <img
                                        src={course.image || 'https://via.placeholder.com/300x150'}
                                        alt={course.title}
                                        className={styles.courseImg}
                                    />
                                </div>
                                <div className={styles.cardBody}>
                                    <h5 className={styles.cardTitle}>{course.title}</h5>
                                    <p className={styles.cardText}>
                                        <b>Description</b> {course.description.substring(0, 100)}...
                                    </p>
                                    <p className={styles.cardText}>
                                        <b>Giá:</b> {course.price} VND
                                    </p>
                                    <div style={{textAlign: 'end'}}>
                                        <button
                                            className={styles.detailsBtn}
                                            onClick={() => navigate(`/hocho/course-detail/${course.courseId}`)}
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
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
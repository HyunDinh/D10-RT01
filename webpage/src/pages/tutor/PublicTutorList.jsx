import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import styles from '../../styles/tutor/Tutor.module.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChalkboardTeacher, faChevronRight} from '@fortawesome/free-solid-svg-icons';

const PublicTutorList = () => {
    const [tutors, setTutors] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useState({
        name: '', specialization: '', minExperience: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchTutors();
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true,
            });
            setCurrentUser(response.data);
        } catch (err) {
        }
    };

    const fetchTutors = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/tutors', {
                withCredentials: true,
            });
            setTutors(response.data);
            setFilteredTutors(response.data.filter((tutor) => tutor.status === 'APPROVED'));
            setLoading(false);
        } catch (err) {
            setError('Unable to load tutor list');
            setLoading(false);
        }
    };

    const handleEdit = (userId) => {
        navigate(`/hocho/teacher/tutors/form/${userId}`);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this tutor?')) return;
        try {
            await axios.delete(`http://localhost:8080/api/tutors/profile/${userId}`, {
                withCredentials: true,
            });
            fetchTutors();
        } catch (err) {
            setError('Unable to delete tutor');
        }
    };

    const handleSearchChange = (e) => {
        const {name, value} = e.target;
        setSearchParams((prev) => ({...prev, [name]: value}));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const filtered = tutors.filter((tutor) => {
            const matchesName = tutor.user.fullName
                .toLowerCase()
                .includes(searchParams.name.toLowerCase());
            const matchesSpecialization = tutor.specialization
                .toLowerCase()
                .includes(searchParams.specialization.toLowerCase());
            const matchesExperience = searchParams.minExperience ? tutor.experience >= parseInt(searchParams.minExperience) : true;
            return tutor.status === 'APPROVED' && matchesName && matchesSpecialization && matchesExperience;
        });
        setFilteredTutors(filtered);
    };

    const handleTeacherDashboard = () => {
        navigate('/hocho/teacher/tutors/form');
    };

    if (loading) return <div className={`${styles.loadingMessage} ${styles.fadeIn}`}>Loading tutor list...</div>;
    if (error) return <div className={`${styles.errorMessage} ${styles.fadeIn}`}>{error}</div>;

    return (<>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>Tutor List</p>
                    <ul className={styles.breadcrumbItems} data-aos="fade-up" data-aos-duration="800"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>Tutors</li>
                    </ul>
                </div>
            </section>

            <div className={styles.tutorPageContainer}>
                <div className={styles.teacherButtonContainer}>
                    {currentUser && currentUser.role && currentUser.role.toLowerCase() === 'teacher' && (
                        <button
                            className={`${styles.teacherButton} ${styles.buttonHover} ${styles.fadeIn}`}
                            onClick={handleTeacherDashboard}
                            title="Go to Teacher Dashboard"
                        >
                            <FontAwesomeIcon icon={faChalkboardTeacher}/> Teacher Dashboard
                        </button>
                    )}
                </div>
                <div className={`${styles.searchContainer} ${styles.animateSlideIn}`}>
                    <h3>Search Tutors</h3>
                    <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Tutor Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={searchParams.name}
                                onChange={handleSearchChange}
                                placeholder="Enter tutor name"
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="specialization">Specialization</label>
                            <input
                                type="text"
                                id="specialization"
                                name="specialization"
                                value={searchParams.specialization}
                                onChange={handleSearchChange}
                                placeholder="Enter specialization"
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="minExperience">Minimum Years of Experience</label>
                            <input
                                type="number"
                                id="minExperience"
                                name="minExperience"
                                value={searchParams.minExperience}
                                onChange={handleSearchChange}
                                placeholder="Enter years"
                                className={styles.inputField}
                            />
                        </div>
                        <button type="submit" className={`${styles.searchButton} ${styles.buttonHover}`}>
                            Search
                        </button>
                    </form>
                </div>
                <div className={styles.tutorContainer}>
                    {filteredTutors.length === 0 ? (
                        <p className={`${styles.noResults} ${styles.fadeIn}`}>No tutors found matching your
                            criteria.</p>) : (<div className={styles.tutorGrid}>
                            {filteredTutors.map((tutor, index) => (<div
                                    key={tutor.tutorId}
                                    className={styles.tutorGridItem}
                                    data-aos="fade-up"
                                    data-aos-delay={index * 100}
                                    data-aos-duration="600"
                                >
                                    <div className={`${styles.tutorCard} ${styles.cardHover}`}>
                                        <h5 className={styles.tutorCardTitle}>{tutor.user.fullName}</h5>
                                        <p className={styles.tutorCardText}><b>Email:</b> {tutor.user.email}</p>
                                        <p className={styles.tutorCardText}><b>Phone
                                            Number:</b> {tutor.user.phoneNumber}</p>
                                        <p className={styles.tutorCardText}>
                                            <b>Specialization:</b> {tutor.specialization}</p>
                                        <p className={styles.tutorCardText}><b>Experience:</b> {tutor.experience} years
                                        </p>
                                        <p className={styles.tutorCardText}><b>Education:</b> {tutor.education}</p>
                                        <p className={styles.tutorCardText}><b>Introduction:</b> {tutor.introduction}
                                        </p>
                                        <div className={styles.tutorBtnGroup}>
                                            <button
                                                className={`${styles.tutorBtn} ${styles.buttonHover}`}
                                                onClick={() => navigate(`/hocho/tutors/profile/${tutor.user.id}`)}
                                            >
                                                View Details
                                            </button>
                                            {currentUser && tutor.user && currentUser.id === tutor.user.id && (<>
                                                    <button
                                                        className={`${styles.tutorBtn} ${styles.buttonHover}`}
                                                        style={{background: '#ffb300', color: '#333'}}
                                                        onClick={() => handleEdit(tutor.user.id)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className={`${styles.tutorBtn} ${styles.buttonHover}`}
                                                        style={{background: '#e53935'}}
                                                        onClick={() => handleDelete(tutor.user.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>)}
                                        </div>
                                    </div>
                                </div>))}
                        </div>)}
                </div>
            </div>
            <Footer/>
        </>);
};

export default PublicTutorList;
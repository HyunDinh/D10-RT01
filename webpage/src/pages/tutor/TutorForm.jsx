import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import styles from '../../styles/tutor/TutorForm.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowLeft, faChalkboardTeacher} from '@fortawesome/free-solid-svg-icons';

const SUBJECTS = ['Math', 'Literature', 'English', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Informatics', 'Other'];

const TutorForm = () => {
    const {userId} = useParams();
    const [form, setForm] = useState({
        specialization: '', experience: '', education: '', introduction: '', phoneNumber: ''
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/hocho/profile', {withCredentials: true});
                setCurrentUser(res.data);
            } catch (err) {
                setError('Cannot get user information');
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (userId) {
            const fetchTutor = async () => {
                try {
                    const res = await axios.get(`http://localhost:8080/api/tutors/profile/${userId}`, {withCredentials: true});
                    const t = res.data;
                    setForm({
                        specialization: t.specialization || '',
                        experience: t.experience || '',
                        education: t.education || '',
                        introduction: t.introduction || '',
                        phoneNumber: t.user?.phoneNumber || ''
                    });
                } catch (err) {
                    setError('Cannot load tutor information');
                }
            };
            fetchTutor();
        }
    }, [userId]);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await axios.post('http://localhost:8080/api/tutors/profile', {...form, userId: userId || currentUser?.id}, {
                withCredentials: true
            });
            setSuccess(userId ? 'Tutor information updated successfully!' : 'Tutor information saved successfully!');
            if (!userId) {
                setForm({specialization: '', experience: '', education: '', introduction: '', phoneNumber: ''});
            }
            setTimeout(() => navigate('/hocho/tutors'), 2000);
        } catch (err) {
            setError('Cannot save tutor information');
        }
        setLoading(false);
    };

    const handleBack = () => {
        navigate('/hocho/tutors');
    };

    const handleTeacherDashboard = () => {
        navigate('/hocho/teacher-dashboard');
    };

    return (<div className={styles.tutorContainer}>
            <h2 className={styles.tutorTitle}>{userId ? 'Edit Tutor Information' : 'Create Tutor Information'}</h2>
            <form className={styles.tutorForm} onSubmit={handleSubmit}>
                <label>Specialization</label>
                <select name="specialization" value={form.specialization} onChange={handleChange} required>
                    <option value="">-- Select specialization --</option>
                    {SUBJECTS.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
                <label>Experience (years)</label>
                <input
                    type="number"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    required
                    min="0"
                />
                <label>Education</label>
                <input
                    type="text"
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    required
                />
                <label>Introduction</label>
                <textarea
                    name="introduction"
                    value={form.introduction}
                    onChange={handleChange}
                    required
                    rows={3}
                />
                <label>Phone Number</label>
                <input
                    type="text"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    required
                />
                {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}
                {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}
                <div className={styles.buttonContainer}>
                    <button
                        type="submit"
                        className={`${styles.tutorBtn} ${styles.buttonHover}`}
                        disabled={loading || (!userId && !currentUser?.id)}
                    >
                        {loading ? 'Saving...' : userId ? 'Update' : 'Save Information'}
                    </button>
                    <button
                        type="button"
                        className={`${styles.backButton} ${styles.buttonHover}`}
                        onClick={handleBack}
                        title="Back to Tutors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft}/> Back
                    </button>
                    {currentUser && currentUser.role === 'TEACHER' && (<button
                            type="button"
                            className={`${styles.teacherButton} ${styles.buttonHover} ${styles.fadeIn}`}
                            onClick={handleTeacherDashboard}
                            title="Go to Teacher Dashboard"
                        >
                            <FontAwesomeIcon icon={faChalkboardTeacher}/> Teacher Dashboard
                        </button>)}
                </div>
            </form>
        </div>);
};

export default TutorForm;
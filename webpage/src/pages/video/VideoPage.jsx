import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";
import Header from "../../components/Header";
import styles from '../../styles/video/VideoPage.module.css'
import Footer from "../../components/Footer";
import ListVideo from "./ListVideo";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import { useTranslation } from 'react-i18next';

export default function VideoPage() {
    const { t } = useTranslation();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [ageGroupFilter, setAgeGroupFilter] = useState('ALL');

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                let apiUrl = 'http://localhost:8080/api/videos/student/all-approved';
                if (ageGroupFilter !== 'ALL') {
                    apiUrl = `http://localhost:8080/api/videos/student/age-group/${ageGroupFilter}`;
                }
                const response = await axios.get(apiUrl, {withCredentials: true});
                setVideos(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching videos:', err);
                setError(t('video_detail_error'));
                setLoading(false);
            }
        };
        fetchVideos();
    }, [ageGroupFilter]);

    const handleCardClick = (videoId) => {
        navigate(`/hocho/video/${videoId}`);
    };

    if (error) {
        return (
            <div className={styles.videoPageContainer}>
                <div className="alert alert-danger">{t('video_detail_error')}</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.videoPageContainer}>
                <div className={styles.videoPageLoading}>{t('video_detail_loading')}</div>
            </div>
        );
    }

    return (<>
            <Header/>
            <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
                <div className={styles.headerInfo}>
                    <p>{t('Video')}</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up"
                        data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">{t('home')}</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight}/>
                        </li>
                        <li>{t('Video')}</li>
                    </ul>
                </div>
            </section>
            <section className={styles.videoPageContainer}>
                <header className={styles.videoPageHeader}>
                    <h2 className={styles.videoPageTitle}>{t('video_for_children')}</h2>
                    <div className={styles.videoPageFilterWrapper}>
                        <select
                            id="ageGroupFilter"
                            value={ageGroupFilter}
                            className={styles.videoPageFilter}
                            onChange={(e) => setAgeGroupFilter(e.target.value)}
                            aria-label={t('filter_videos_by_age_group')}
                        >
                            <option value="ALL">{t('all')}</option>
                            <option value="AGE_4_6">{t('age_4_6')}</option>
                            <option value="AGE_7_9">{t('age_7_9')}</option>
                            <option value="AGE_10_12">{t('age_10_12')}</option>
                            <option value="AGE_13_15">{t('age_13_15')}</option>
                        </select>
                    </div>
                </header>
                <ListVideo videos={videos} onCardClick={handleCardClick}/>
            </section>
            <Footer/>
        </>
    );
}
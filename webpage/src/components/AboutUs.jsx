import React from "react";
import "../styles/AboutUs.css";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import {useTranslation} from 'react-i18next';
import styles from "../styles/AnswerQuestion/QuestionList.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight} from "@fortawesome/free-solid-svg-icons";

const teamMembers = [{
    name: "Dinh Hung", role: "Founder & CEO", bio: "Passionate about education and technology.",
}, {
    name: "Vu Binh Minh", role: "Lead Developer", bio: "Loves building impactful web applications.",
}, {
    name: "Nguyen Chon Phuoc", role: "UI/UX Designer", bio: "Designs beautiful and user-friendly interfaces.",
}, {
    name: "Nguyen Thanh Dat", role: "UI/UX Designer", bio: "Designs beautiful and user-friendly interfaces.",
}, {
    name: "Pham Hung Thinh", role: "UI/UX Designer", bio: "Designs beautiful and user-friendly interfaces.",
},];

const AboutUs = () => {
    const {t} = useTranslation();
    return (<><Header/>
        <section className={styles.sectionHeader} style={{backgroundImage: `url(/background.png)`}}>
            <div className={styles.headerInfo}>
                <p>{t('about_title')}</p>
                <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                    <li>
                        <a href="/hocho/home">Home</a>
                    </li>
                    <li>
                        <FontAwesomeIcon icon={faChevronRight}/>
                    </li>
                    <li>{t('about_title')}</li>
                </ul>
            </div>
        </section>

        <div className="aboutus-container">
            <p className="aboutus-intro">
                {t('about_intro')}
            </p>
            <section className="aboutus-mission">
                <h2>{t('about_mission_title')}</h2>
                <p>
                    {t('about_mission_content')}
                </p>
            </section>
            <section className="aboutus-team">
                <h2>{t('about_team_title')}</h2>
                <div className="aboutus-team-list">
                    {teamMembers.map((member, idx) => (<div className="aboutus-team-member" key={idx}>
                        <h3>{member.name}</h3>
                        <h4>{t(`role_${member.role.replace(/\s|&/g, '_').toLowerCase()}`)}</h4>
                        <p>{t(`bio_${member.name.replace(/\s/g, '_').toLowerCase()}`)}</p>
                    </div>))}
                </div>
            </section>
        </div>
        <Footer/>
    </>);
};

export default AboutUs;
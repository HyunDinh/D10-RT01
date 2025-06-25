import React from 'react';
import styles from '../styles/BannerHeader.module.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlay, faStar,faArrowRight} from "@fortawesome/free-solid-svg-icons";
import {faFacebookF} from "@fortawesome/free-brands-svg-icons";

const BannerHeader = () => {
    return (<section className={styles.banner} aria-labelledby="banner-title">
        <div className={styles.container}>

            <div className={styles.star}>
                <img
                    alt="Decorative bee shape"
                    fetchPriority="high"
                    width={30}
                    height={30}
                    src="/star.png"
                    srcSet="/star.png 1x, /star.png 2x"
                    style={{ color: 'transparent' }}
                />
            </div>
            <div className={styles.pencil}>
                <img
                    alt="Decorative bee shape"
                    fetchPriority="high"
                    width={40}
                    height={40}
                    src="/pencil.png"
                    srcSet="/pencil.png 1x, /pencil.png 2x"
                    style={{ color: 'transparent' }}
                />
            </div>
            <div className={styles.ballon}>
                <img
                    alt="Decorative bee shape"
                    fetchPriority="high"
                    width={50}
                    height={70}
                    src="/parasuit.webp"
                    srcSet="/parasuit.webp 1x, /parasuit.webp 2x"
                    style={{ color: 'transparent' }}
                />
            </div>
            <div className={styles.beeShape}>
                <img
                    alt="Decorative bee shape"
                    fetchPriority="high"
                    width={70}
                    height={70}
                    src="/bee.webp"
                    srcSet="/bee.webp 1x, /bee.webp 2x"
                    style={{ color: 'transparent' }}
                />
            </div>
            <div className={styles.bookShape}>
                <img
                    alt="Decorative book shape"
                    fetchPriority="high"
                    width={70}
                    height={70}
                    src="/book.png"
                    srcSet="/book.png 1x, /book.png 2x"
                    style={{ color: 'transparent' }}
                />
            </div>
            <div className={styles.row}>
                {/* Content Section */}
                <div className={styles.contentColumn}>
                    <div className={styles.heroContent}>
                        <h5
                            data-aos="fade-up"
                            data-aos-duration="800"
                        >
                            Studying & PLaying <FontAwesomeIcon icon={faStar}/>
                        </h5>
                        <h1
                            id="banner-title"
                            data-aos="fade-up"
                            data-aos-duration="800"
                            data-aos-delay="300"
                        >
                            Kid's Promising <br/>
                            <span>Tomorrow</span> Ahead
                        </h1>
                        <p
                            data-aos="fade-up"
                            data-aos-duration="800"
                            data-aos-delay="500"
                        >
                            Discover a nurturing environment where your child can grow, learn, and thrive with our
                            dedicated care and education programs.
                        </p>
                        <div className={styles.heroButton}>
                            <a
                                href="/contact"
                                className={styles.themeBtn}
                                data-aos="fade-up"
                                data-aos-duration="800"
                                data-aos-delay="700"
                            >
                                Apply Today
                                <FontAwesomeIcon icon={faArrowRight} />
                            </a>
                            <span className={styles.buttonText} data-aos="fade-up" data-aos-duration="800"
                                  data-aos-delay="800">
                                 <a href="#" className={`${styles.videoBtn} video-popup`} aria-label="Play video">
                                     <FontAwesomeIcon icon={faPlay}/>
                                 </a>
                                 <span>Watch Our Story</span>
                             </span>
                        </div>
                    </div>
                </div>

                {/* Image Section */}
                <div className={styles.imageColumn}>
                    <div
                        className={styles.heroImage}
                        data-aos="fade-up"
                        data-aos-duration="800"
                        data-aos-delay="400"
                    >
                        <img
                            alt="Kindergarten children playing"
                            fetchPriority="high"
                            width={500}
                            height={600}
                            src="/bannerHeader.webp"
                            srcSet="/bannerHeader.webp 1x, /bannerHeader.webp 2x"
                        />
                        <div className={styles.heroShape}>
                            <img
                                alt="Decorative shape"
                                fetchPriority="high"
                                width={600}
                                height={500}
                                src="/iconHeader.png"
                                srcSet="/iconHeader.png 1x, /iconHeader.png"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
            <div className={styles.bottom}>
                <img
                    alt="Decorative bee shape"
                    fetchPriority="high"
                    src="/bottom.webp"
                    srcSet="/bottom.webp 1x, /bottom.webp 2x"
                    style={{ color: 'transparent' }}
                />
            </div>

    </section>
    )
};

export default BannerHeader;
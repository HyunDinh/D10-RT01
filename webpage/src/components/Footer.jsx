import React from 'react';
import styles from '../styles/Footer.module.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFacebookF, faGithub, faGoogle, faTwitter} from "@fortawesome/free-brands-svg-icons";

function Footer() {
    return (<footer className={styles.footer}>
        <div className={styles.containerfluid}>
            <div className={styles.footerTop}>
                <img src="/frameFooter.png" alt="footer-bg" width={150} height={150}/>
            </div>
            <div className={styles.zebra}>
                <img src="/zebra.webp" alt="footer-bg" width={100} height={150}/>
            </div>
            <div className={styles.container}>
                <div className={styles.footerContactInfo}>
                    <div className={styles.contactInfoItems} data-aos="fade-up" data-aos-duration="800"
                         data-aos-delay="300">
                        <div className={styles.icon}>
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M23.7891
                                    1.81641H16.7578C13.3658
                                     1.81641 10.6055 4.5767
                                      10.6055 7.96875C10.6055
                                       11.063 12.9015 13.631
                                       15.8789 14.0585V16.
                                       7578C15.8788 16.9317
                                       15.9303 17.1016 16.0268
                                       17.2462C16.1234 17.3907 16.2607
                                       17.5033 16.4214 17.5697C16.7456
                                        17.705 17.1258 17.6325 17.3793
                                         17.3792L20.6374 14.1211H23.7891C27.1811
                                          14.1211 30 11.3608 30 7.96875C30 4.5767
                                           27.1811 1.81641 23.7891 1.81641ZM16.7578
                                           8.84754C16.2723 8.84754 15.8789 8.45402
                                           15.8789 7.96863C15.8789 7.48324 16.2723 7.08973 16.7578 7.08973C17.2432 7.08973 17.6367 7.48324 17.6367 7.96863C17.6367 8.45402 17.2432 8.84754 16.7578 8.84754ZM20.2734 8.84754C19.7879 8.84754 19.3945 8.45402 19.3945 7.96863C19.3945 7.48324 19.7879 7.08973 20.2734 7.08973C20.7588 7.08973 21.1523 7.48324 21.1523 7.96863C21.1523 8.45402 20.7588 8.84754 20.2734 8.84754ZM23.7891 8.84754C23.3036 8.84754 22.9102 8.45402 22.9102 7.96863C22.9102 7.48324 23.3036 7.08973 23.7891 7.08973C24.2745 7.08973 24.668 7.48324 24.668 7.96863C24.668 8.45402 24.2745 8.84754 23.7891 8.84754Z"
                                    fill="#F39F5F"
                                />
                                <path
                                    d="M19.7461 28.1836C21.2 28.1836 22.3828 27.0008 22.3828 25.5469V22.0312C22.3828 21.6527 22.1408 21.3171 21.782 21.1978L16.5209 19.44C16.2634 19.3533 15.9819 19.3928 15.7553 19.5421L13.5186 21.033C11.1496 19.9035 8.33871 17.0925 7.20914 14.7236L8.7 12.4868C8.77415 12.3754 8.82189 12.2485 8.83958 12.1158C8.85728 11.9831 8.84447 11.8482 8.80213 11.7212L7.04432 6.46014C6.98611 6.28516 6.87428 6.13295 6.72469 6.02512C6.5751 5.91728 6.39534 5.85929 6.21094 5.85938H2.63672C1.18277 5.85938 0 7.02979 0 8.48373C0 18.61 9.6198 28.1836 19.7461 28.1836Z"
                                    fill="#F39F5F"
                                />
                            </svg>
                        </div>
                        <div className={styles.content}>
                            <p>Call Us 7/24</p>
                            <h3><a href="tel:+2085550112">+208-555-0112</a></h3>
                        </div>
                    </div>
                    <div className={styles.contactInfoItems} data-aos="fade-up" data-aos-duration="800"
                         data-aos-delay="500">
                        <div className={styles.icon}>
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12.6493 10.8272C12.8019 10.914 12.9755 10.9569 13.1509 10.9509C13.3307 10.9344 13.5048 10.8798 13.6618 10.7906L24.9212 4.22062C24.6765 3.79416 24.324 3.43955 23.8989 3.19239C23.4739 2.94523 22.9913 2.81422 22.4996 2.8125H3.74965C3.25782 2.81406 2.77505 2.94499 2.34983 3.19216C1.92461 3.43932 1.57191 3.79402 1.32715 4.22062L12.6493 10.8272Z"
                                    fill="#F39F5F"
                                />
                                <path
                                    d="M25.3125 6.15918V12.6748C24.4104 12.3501 23.4587 12.1852 22.5 12.1873C20.2633 12.1908 18.1192 13.0808 16.5376 14.6624C14.956 16.244 14.066 18.3881 14.0625 20.6248C14.0623 20.9382 14.0811 21.2512 14.1188 21.5623H3.75C3.00476 21.5601 2.29069 21.263 1.76372 20.7361C1.23676 20.2091 0.939726 19.495 0.9375 18.7498V6.15918L11.7094 12.4498C12.1434 12.6872 12.6303 12.8116 13.125 12.8116C13.6197 12.8116 14.1066 12.6872 14.5406 12.4498L25.3125 6.15918Z"
                                    fill="#F39F5F"
                                />
                                <path
                                    d="M22.5 14.0625C20.7595 14.0625 19.0903 14.7539 17.8596 15.9846C16.6289 17.2153 15.9375 18.8845 15.9375 20.625C15.9375 22.3655 16.6289 24.0347 17.8596 25.2654C19.0903 26.4961 20.7595 27.1875 22.5 27.1875C22.7486 27.1875 22.9871 27.0887 23.1629 26.9129C23.3387 26.7371 23.4375 26.4986 23.4375 26.25C23.4375 26.0014 23.3387 25.7629 23.1629 25.5871C22.9871 25.4113 22.7486 25.3125 22.5 25.3125C21.5729 25.3125 20.6666 25.0376 19.8958 24.5225C19.1249 24.0074 18.5241 23.2754 18.1693 22.4188C17.8145 21.5623 17.7217 20.6198 17.9026 19.7105C18.0834 18.8012 18.5299 17.966 19.1854 17.3104C19.841 16.6549 20.6762 16.2084 21.5855 16.0276C22.4948 15.8467 23.4373 15.9395 24.2938 16.2943C25.1504 16.6491 25.8824 17.2499 26.3975 18.0208C26.9126 18.7916 27.1875 19.6979 27.1875 20.625V21.5625C27.1875 21.8111 27.0887 22.0496 26.9129 22.2254C26.7371 22.4012 26.4986 22.5 26.25 22.5C26.0014 22.5 25.7629 22.4012 25.5871 22.2254C25.4113 22.0496 25.3125 21.8111 25.3125 21.5625V20.625C25.3125 20.0687 25.1476 19.525 24.8385 19.0625C24.5295 18.5999 24.0902 18.2395 23.5763 18.0266C23.0624 17.8137 22.4969 17.758 21.9513 17.8665C21.4057 17.9751 20.9046 18.2429 20.5113 18.6363C20.1179 19.0296 19.8501 19.5307 19.7415 20.0763C19.633 20.6219 19.6887 21.1874 19.9016 21.7013C20.1145 22.2152 20.4749 22.6545 20.9375 22.9635C21.4 23.2726 21.9437 23.4375 22.5 23.4375C22.9843 23.4344 23.4594 23.3048 23.8781 23.0616C24.2022 23.578 24.6856 23.9748 25.2552 24.1921C25.8248 24.4094 26.4496 24.4353 27.0353 24.266C27.621 24.0967 28.1356 23.7412 28.5013 23.2535C28.867 22.7657 29.064 22.1721 29.0625 21.5625V20.625C29.0605 18.8851 28.3685 17.2171 27.1382 15.9868C25.9079 14.7565 24.2399 14.0645 22.5 14.0625ZM22.5 21.5625C22.3146 21.5625 22.1333 21.5075 21.9792 21.4045C21.825 21.3015 21.7048 21.1551 21.6339 20.9838C21.5629 20.8125 21.5443 20.624 21.5805 20.4421C21.6167 20.2602 21.706 20.0932 21.8371 19.9621C21.9682 19.831 22.1352 19.7417 22.3171 19.7055C22.499 19.6693 22.6875 19.6879 22.8588 19.7589C23.0301 19.8298 23.1765 19.95 23.2795 20.1042C23.3825 20.2583 23.4375 20.4396 23.4375 20.625C23.4375 20.8736 23.3387 21.1121 23.1629 21.2879C22.9871 21.4637 22.7486 21.5625 22.5 21.5625Z"
                                    fill="#F39F5F"
                                />
                            </svg>
                        </div>
                        <div className={styles.content}>
                            <p>Make a Quote</p>
                            <h3><a href="mailto:kidsa@gmail.com">kidsa@gmail.com</a></h3>
                        </div>
                    </div>
                    <div className={styles.contactInfoItems} data-aos="fade-up" data-aos-duration="800"
                         data-aos-delay="700">
                        <div className={styles.icon}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M16 1.66699C11.036 1.66699 7 5.73899 7 10.7617C7 12.463 7.74933 14.5737 8.84 16.679C11.2413 21.315 15.2413 25.9843 15.2413 25.9843C15.3352 26.0937 15.4516 26.1814 15.5826 26.2416C15.7135 26.3017 15.8559 26.3328 16 26.3328C16.1441 26.3328 16.2865 26.3017 16.4174 26.2416C16.5484 26.1814 16.6648 26.0937 16.7587 25.9843C16.7587 25.9843 20.7587 21.315 23.16 16.679C24.2507 14.5737 25 12.463 25 10.7617C25 5.73899 20.964 1.66699 16 1.66699ZM16 7.00033C15.0447 7.02609 14.1371 7.4237 13.4705 8.10853C12.8039 8.79335 12.4309 9.7113 12.4309 10.667C12.4309 11.6227 12.8039 12.5406 13.4705 13.2255C14.1371 13.9103 15.0447 14.3079 16 14.3337C16.9553 14.3079 17.8629 13.9103 18.5295 13.2255C19.1961 12.5406 19.5691 11.6227 19.5691 10.667C19.5691 9.7113 19.1961 8.79335 18.5295 8.10853C17.8629 7.4237 16.9553 7.02609 16 7.00033Z"
                                    fill="#F39F5F"
                                />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M22.3783 23.1693C23.4623 23.4946 24.3557 23.8973 24.973 24.3693C25.373 24.6733 25.6663 24.9706 25.6663 25.3333C25.6663 25.5466 25.545 25.74 25.3743 25.9333C25.0917 26.252 24.6717 26.5386 24.1517 26.8053C22.3143 27.7453 19.3437 28.3333 15.9997 28.3333C12.6557 28.3333 9.68501 27.7453 7.84767 26.8053C7.32767 26.5386 6.90767 26.252 6.62501 25.9333C6.45434 25.74 6.33301 25.5466 6.33301 25.3333C6.33301 24.9706 6.62634 24.6733 7.02634 24.3693C7.64367 23.8973 8.53701 23.4946 9.62101 23.1693C9.87509 23.0929 10.0884 22.9187 10.2141 22.6851C10.3397 22.4514 10.3674 22.1774 10.291 21.9233C10.2146 21.6692 10.0404 21.4559 9.80677 21.3302C9.5731 21.2046 9.29909 21.1769 9.04501 21.2533C7.39434 21.7506 6.11167 22.432 5.34101 23.1853C4.66367 23.8453 4.33301 24.584 4.33301 25.3333C4.33301 26.2693 4.86234 27.2026 5.93834 27.9813C7.82634 29.3466 11.6183 30.3333 15.9997 30.3333C20.381 30.3333 24.173 29.3466 26.061 27.9813C27.137 27.2026 27.6663 26.2693 27.6663 25.3333C27.6663 24.584 27.3357 23.8453 26.6583 23.1853C25.8877 22.432 24.605 21.7506 22.9543 21.2533C22.8285 21.2155 22.6965 21.2028 22.5658 21.216C22.4351 21.2292 22.3083 21.268 22.1926 21.3302C22.0769 21.3925 21.9746 21.4769 21.8915 21.5786C21.8084 21.6804 21.7462 21.7975 21.7083 21.9233C21.6705 22.0491 21.6578 22.1811 21.6711 22.3118C21.6843 22.4425 21.7231 22.5694 21.7853 22.6851C21.8475 22.8008 21.9319 22.9031 22.0337 22.9862C22.1354 23.0692 22.2525 23.1315 22.3783 23.1693Z"
                                    fill="#F39F5F"
                                />
                            </svg>
                        </div>
                        <div className={styles.content}>
                            <p>Location</p>
                            <h3>4517 Washington ave.</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className={styles.container}>
            <div className={styles.footerGrid}>
                <div className={styles.footerWidget} data-aos="fade-up" data-aos-duration="800"
                     data-aos-delay="300">
                    <div className={styles.widgetHeader}>
                        <a href="/">
                            <img src="/logo.png" alt="Logo" width="100" height="50" loading="lazy"
                                 style={{borderRadius: '50%'}}/>
                        </a>
                    </div>
                    <div className={styles.widgetContent}>
                        <p>Phasellus ultricies aliquam volutpat ullamcorper laoreet neque, a lacinia curabitur
                            lacinia mollis.</p>
                        <div className={styles.socialLinks}>
                            <a href="#" aria-label="Facebook"> <FontAwesomeIcon icon={faFacebookF} bounce className={styles.socialLinksIcon}/></a>
                            <a href="#" aria-label="Twitter"> <FontAwesomeIcon icon={faTwitter} bounce/></a>
                            <a href="#" aria-label="LinkedIn"> <FontAwesomeIcon icon={faGithub} bounce/></a>
                            <a href="#" aria-label="YouTube"> <FontAwesomeIcon icon={faGoogle} bounce/></a>
                        </div>
                    </div>
                </div>

                <div className={styles.footerWidget} data-aos="fade-up" data-aos-duration="800"
                     data-aos-delay="500">
                    <div className={styles.widgetHeader}>
                        <h3>Quick Links</h3>
                    </div>
                    <ul className={styles.linkList}>
                        <li><a href="/program-details"><i className="fas fa-chevron-right"></i> Our Services</a>
                        </li>
                        <li><a href="/news-details"><i className="fas fa-chevron-right"></i> Our Blogs</a></li>
                        <li><a href="/faq"><i className="fas fa-chevron-right"></i> FAQ'S</a></li>
                        <li><a href="/contact"><i className="fas fa-chevron-right"></i> Contact Us</a></li>
                    </ul>
                </div>

                <div className={styles.footerWidget} data-aos="fade-up" data-aos-duration="800"
                     data-aos-delay="500">
                    <div className={styles.widgetHeader}>
                        <h3>Categories</h3>
                    </div>
                    <ul className={styles.linkList}>
                        <li><a href="/program-details"><i className="fas fa-chevron-right"></i> Music Learning</a>
                        </li>
                        <li><a href="/program-details"><i className="fas fa-chevron-right"></i> Sports, Games</a>
                        </li>
                        <li><a href="/program-details"><i className="fas fa-chevron-right"></i> Science Class</a>
                        </li>
                        <li><a href="/program-details"><i className="fas fa-chevron-right"></i> Drawing</a></li>
                    </ul>
                </div>

                <div className={styles.footerWidget} data-aos="fade-up" data-aos-duration="800"
                     data-aos-delay="700">
                    <div className={styles.widgetHeader}>
                        <h3>Recent Posts</h3>
                    </div>
                    <div className={styles.recentPosts}>
                        <article className={styles.post}>
                            <img src="/pp1.webp" alt="Post 1" width="78" height="79" loading="lazy"/>
                            <div className={styles.postContent}>
                                <span className={styles.postDate}><i className="fas fa-calendar-days"></i> 20 Feb, 2024</span>
                                <h6><a href="/news-details">That jerk from Finance really threw me</a></h6>
                            </div>
                        </article>
                        <article className={styles.post}>
                            <img src="/pp2.webp" alt="Post 2" width="78" height="79" loading="lazy"/>
                            <div className={styles.postContent}>
                                <span className={styles.postDate}><i className="fas fa-calendar-days"></i> 15 Dec, 2024</span>
                                <h6><a href="/news-details">From without content style without</a></h6>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
            <div className={styles.bottomFooter}>
                <img src="/footerBottom.png" alt="Footer Bottom" loading="lazy"/>
            </div>
        </div>
    </footer>);
}

export default Footer;
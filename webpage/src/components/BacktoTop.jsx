import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/BackToTop.module.css'; // Dedicated CSS module file

function BackToTop() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Track scrolling to show/hide button
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) { // Show button when scrolled more than 300px
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Function to scroll to top
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Smooth scrolling
        });
    };

    return (
        <>
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className={styles.backToTop}
                    aria-label="Back to Top"
                >
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>
            )}
        </>
    );
}

export default BackToTop;
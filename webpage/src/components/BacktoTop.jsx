import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/BackToTop.module.css'; // File CSS module riêng

function BackToTop() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Theo dõi cuộn để hiển thị/ẩn nút
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) { // Hiển thị nút khi cuộn xuống hơn 300px
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hàm cuộn về đầu trang
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Cuộn mượt mà
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
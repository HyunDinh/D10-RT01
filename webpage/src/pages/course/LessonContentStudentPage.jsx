import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import ReactPlayer from 'react-player';
import { Document, Page, pdfjs } from 'react-pdf';
import styles from '../../styles/lesson/LessonContentStudentPage.module.css';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const LessonContentStudentPage = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedContentId, setSelectedContentId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // Pagination for content list
    const [pdfPageNumber, setPdfPageNumber] = useState(1); // Pagination for PDF
    const [numPages, setNumPages] = useState(null); // Total PDF pages
    const [fileBuffer, setFileBuffer] = useState(null); // ArrayBuffer for content
    const contentsPerPage = 5; // Configurable items per page

    useEffect(() => {
        fetchContents();
        // eslint-disable-next-line
    }, [lessonId]);

    const fetchContents = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/lesson-contents/${lessonId}`, { withCredentials: true });
            const fetchedContents = response.data;
            setContents(fetchedContents);
            setSelectedContentId(fetchedContents[0]?.contentId || null); // Select first content by default
            setLoading(false);
        } catch (err) {
            setError('Không thể tải nội dung bài học.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedContentId) {
            fetchContentData();
        }
        // eslint-disable-next-line
    }, [selectedContentId]);

    const fetchContentData = async () => {
        try {
            const response = await axios.get(`/api/lesson-contents/content/${selectedContentId}`);
            const fetchedContent = response.data;
            if (fetchedContent && fetchedContent.contentData) {
                const arrayBuffer = base64ToArrayBuffer(fetchedContent.contentData);
                setFileBuffer(arrayBuffer);
                setPdfPageNumber(1); // Reset PDF page number
                setNumPages(null); // Reset PDF pages
            } else {
                setError('Không thể tải nội dung: dữ liệu bị thiếu hoặc không hợp lệ.');
                setFileBuffer(null);
            }
        } catch (err) {
            setError('Không thể tải nội dung.');
            setFileBuffer(null);
        }
    };

    const base64ToArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleContentSelect = (contentId) => {
        setSelectedContentId(contentId);
        setCurrentPage(1); // Reset content list pagination
    };

    // Pagination for content list
    const totalContents = contents.length;
    const totalPages = Math.ceil(totalContents / contentsPerPage);
    const startIndex = (currentPage - 1) * contentsPerPage;
    const endIndex = startIndex + contentsPerPage;
    const currentContents = contents.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) return <div className={styles.loading}>Đang tải nội dung...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    const selectedContent = contents.find((content) => content.contentId === selectedContentId);

    const renderContent = () => {
        if (!selectedContent || !fileBuffer) {
            return <div className={styles.noContent}>Đang tải nội dung...</div>;
        }

        switch (selectedContent.contentType) {
            case 'VIDEO':
                return (
                    <div className={styles.playerContainer}>
                        <ReactPlayer
                            url={URL.createObjectURL(new Blob([fileBuffer], { type: 'video/mp4' }))}
                            controls
                            width="100%"
                            height="auto"
                            className={styles.videoPlayer}
                        />
                    </div>
                );
            case 'PDF':
                return (
                    <div className={styles.pdfContainer}>
                        <Document
                            key={selectedContentId}
                            file={fileBuffer}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onError={(error) => {
                                setError('Không thể tải tài liệu PDF.');
                            }}
                        >
                            <Page pageNumber={pdfPageNumber} className={styles.pdfPage} />
                        </Document>
                        <div className={styles.pdfControls}>
                            <button
                                className={`${styles.pdfButton} ${pdfPageNumber <= 1 ? styles.disabled : ''}`}
                                onClick={() => setPdfPageNumber(pdfPageNumber - 1)}
                                disabled={pdfPageNumber <= 1}
                                aria-label="Trang trước của PDF"
                            >
                                Trước
                            </button>
                            <span className={styles.pdfPageInfo}>
                Trang {pdfPageNumber} / {numPages || '...'}
              </span>
                            <button
                                className={`${styles.pdfButton} ${pdfPageNumber >= numPages ? styles.disabled : ''}`}
                                onClick={() => setPdfPageNumber(pdfPageNumber + 1)}
                                disabled={pdfPageNumber >= numPages}
                                aria-label="Trang sau của PDF"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div className={styles.noContent}>Loại nội dung không được hỗ trợ.</div>;
        }
    };

    return (
        <>
            <Header />
            <section className={styles.sectionHeader} style={{ backgroundImage: `url(/background.png)` }}>
                <div className={styles.headerInfo}>
                    <p>Lesson Content</p>
                    <ul className={styles.breadcrumbItems} data-aos-duration="800" data-aos="fade-up" data-aos-delay="500">
                        <li>
                            <a href="/hocho/home">Home</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>Lesson Content</li>
                    </ul>
                </div>
            </section>
            <div className={styles.lessonContainer}>
                {contents.length === 0 ? (
                    <p className={styles.noContent}>Chưa có nội dung nào cho bài học này.</p>
                ) : (
                    <div className={styles.contentLayout}>
                        {/* Left Column: Content List */}
                        <div className={styles.contentList}>
                            {currentContents.map((content, index) => (
                                <button
                                    key={content.contentId}
                                    className={`${styles.contentItem} ${
                                        selectedContentId === content.contentId ? styles.contentItemActive : ''
                                    }`}
                                    onClick={() => handleContentSelect(content.contentId)}
                                    aria-label={`Chọn nội dung ${content.title}`}
                                >
                                    <span className={styles.contentItemNumber}>{startIndex + index + 1}</span>
                                    <div className={styles.contentItemDetails}>
                                        <h3 className={styles.contentItemTitle}>{content.title}</h3>
                                        <p className={styles.contentItemText}>Loại: {content.contentType}</p>
                                        <p className={styles.contentItemText}>
                                            Ngày tạo: {new Date(content.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className={styles.paginationContainer}>
                                    <button
                                        className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        aria-label="Trang trước"
                                    >
                                        Trước
                                    </button>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            className={`${styles.paginationButton} ${
                                                currentPage === index + 1 ? styles.paginationButtonActive : ''
                                            }`}
                                            onClick={() => handlePageChange(index + 1)}
                                            aria-label={`Trang ${index + 1}`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        aria-label="Trang sau"
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Right Column: Content Player */}
                        <div className={styles.contentDetails}>
                            {selectedContent ? (
                                <>
                                    <h2 className={styles.contentDetailsTitle}>{selectedContent.title}</h2>
                                    {renderContent()}
                                </>
                            ) : (
                                <p className={styles.noContent}>Vui lòng chọn một nội dung để xem chi tiết.</p>
                            )}
                        </div>
                    </div>
                )}
                <div className={styles.lessonFooter}>
                    <button
                        className={styles.backButton}
                        onClick={() => navigate(-1)}
                        aria-label="Quay lại trang trước"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LessonContentStudentPage;
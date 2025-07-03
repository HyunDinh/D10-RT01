import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { Document, Page, pdfjs } from 'react-pdf';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import EditLessonContentPage from './EditLessonContentPage.jsx';
import AddLessonContentPage from './AddLessonContentPage.jsx';
import styles from '../../styles/lesson/LessonContent.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const LessonContentPage = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [contents, setContents] = useState([]);
    const [selectedContentId, setSelectedContentId] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);
    const [loadingContents, setLoadingContents] = useState(true);
    const [loadingPlayer, setLoadingPlayer] = useState(false);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteContentId, setDeleteContentId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editContentId, setEditContentId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [fileBuffer, setFileBuffer] = useState(null);

    // Fetch all contents for the lesson
    useEffect(() => {
        const fetchContents = async () => {
            try {
                setLoadingContents(true);
                const response = await axios.get(`/api/lesson-contents/${lessonId}`, { withCredentials: true });
                setContents(response.data);
                setLoadingContents(false);
                if (response.data.length > 0) {
                    setSelectedContentId(response.data[0].contentId);
                }
            } catch (err) {
                console.error('Error fetching lesson contents:', err);
                setError('Failed to load lesson contents. Please try again later.');
                setLoadingContents(false);
            }
        };
        fetchContents();
    }, [lessonId]);

    // Fetch content details for the selected content
    useEffect(() => {
        if (!selectedContentId) return;
        const fetchContent = async () => {
            try {
                setLoadingPlayer(true);
                const response = await axios.get(`/api/lesson-contents/content/${selectedContentId}`, { withCredentials: true });
                const fetchedContent = response.data;
                setSelectedContent(fetchedContent);

                if (fetchedContent && fetchedContent.contentData) {
                    const arrayBuffer = base64ToArrayBuffer(fetchedContent.contentData);
                    setFileBuffer(arrayBuffer);
                } else {
                    setError('Content data is missing or invalid.');
                    setFileBuffer(null);
                }
                setLoadingPlayer(false);
            } catch (error) {
                console.error('Error fetching content:', error);
                setError('Failed to load content.');
                setLoadingPlayer(false);
                setFileBuffer(null);
            }
        };
        fetchContent();
    }, [selectedContentId]);

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
        setPageNumber(1);
    };

    const handleContentClick = (contentId) => {
        setSelectedContentId(contentId);
    };

    const handleDeleteClick = (contentId) => {
        setDeleteContentId(contentId);
        setShowDeleteConfirm(true);
    };

    const handleDeleteCancel = () => {
        const modal = document.querySelector(`.${styles.modal}`);
        const modalContent = document.querySelector(`.${styles.modalContent}`);
        if (modal && modalContent) {
            modal.classList.add('closing');
            modalContent.classList.add('closing');
            setTimeout(() => {
                setShowDeleteConfirm(false);
                setDeleteContentId(null);
            }, 300);
        } else {
            setShowDeleteConfirm(false);
            setDeleteContentId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/lesson-contents/${deleteContentId}`, { withCredentials: true });
            setShowDeleteConfirm(false);
            setDeleteContentId(null);
            const response = await axios.get(`/api/lesson-contents/${lessonId}`, { withCredentials: true });
            setContents(response.data);
            if (selectedContentId === deleteContentId) {
                setSelectedContentId(response.data.length > 0 ? response.data[0].contentId : null);
            }
            alert('Content deleted successfully');
        } catch (error) {
            console.error('Error deleting content:', error);
            setShowDeleteConfirm(false);
            setDeleteContentId(null);
            alert('Failed to delete content');
        }
    };

    const handleEditClick = (contentId) => {
        setEditContentId(contentId);
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        const modal = document.querySelector(`.${styles.modal}`);
        const modalContent = document.querySelector(`.${styles.modalContent}`);
        if (modal && modalContent) {
            modal.classList.add('closing');
            modalContent.classList.add('closing');
            setTimeout(() => {
                setShowEditModal(false);
                setEditContentId(null);
            }, 300);
        } else {
            setShowEditModal(false);
            setEditContentId(null);
        }
    };

    const handleAddClick = () => {
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        const modal = document.querySelector(`.${styles.modal}`);
        const modalContent = document.querySelector(`.${styles.modalContent}`);
        if (modal && modalContent) {
            modal.classList.add('closing');
            modalContent.classList.add('closing');
            setTimeout(() => {
                setShowAddModal(false);
            }, 300);
        } else {
            setShowAddModal(false);
        }
    };

    const handleContentUpdated = async () => {
        const response = await axios.get(`/api/lesson-contents/${lessonId}`, { withCredentials: true });
        setContents(response.data);
        if (!contents.some((content) => content.contentId === selectedContentId)) {
            setSelectedContentId(response.data.length > 0 ? response.data[0].contentId : null);
        }
    };

    const handleContentAdded = async () => {
        const response = await axios.get(`/api/lesson-contents/${lessonId}`, { withCredentials: true });
        setContents(response.data);
        setSelectedContentId(response.data.length > 0 ? response.data[0].contentId : null);
    };

    const renderContent = () => {
        if (!selectedContent || !fileBuffer) {
            return <div className={styles.noLessons}>Content not available.</div>;
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
                        />
                    </div>
                );
            case 'PDF':
                return (
                    <div className={styles.playerContainer}>
                        <Document
                            key={selectedContentId}
                            file={fileBuffer}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onError={(error) => {
                                console.error('Error loading PDF:', error);
                                alert('Failed to load PDF document.');
                            }}
                        >
                            <Page pageNumber={pageNumber} width={600} />
                        </Document>
                        <div className={styles.pdfControls}>
                            <button
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(pageNumber - 1)}
                            >
                                Previous
                            </button>
                            <span>
                Page {pageNumber} of {numPages || 1}
              </span>
                            <button
                                className={`${styles.btn} ${styles.btnSecondary}`}
                                disabled={pageNumber >= numPages}
                                onClick={() => setPageNumber(pageNumber + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div className={styles.noLessons}>Unsupported content type.</div>;
        }
    };

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.alertDanger}>{error}</div>
            </div>
        );
    }

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
                        <li>
                            <a href={`/hocho/teacher/course/${courseId}/lesson`}>Course Detail</a>
                        </li>
                        <li>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </li>
                        <li>Lesson Content</li>
                    </ul>
                </div>
            </section>

            <main className={styles.container}>
                <header className={styles.pageHeader}>
                    <h2 className={styles.pageTitle}>Lesson Contents</h2>
                    <div className={styles.actionButtons}>
                        <button
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={handleAddClick}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Add New Content
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnSecondary}`}
                            onClick={() => navigate(`/hocho/teacher/course/${courseId}/lesson`)}
                        >
                            Back to Lesson
                        </button>
                    </div>
                </header>

                <div className={styles.splitContainer}>
                    {/* Left Side: Content List */}
                    <div className={styles.contentList}>
                        <h3 className={styles.contentListTitle}>Content List</h3>
                        {loadingContents ? (
                            <div className={styles.loading}>Loading contents...</div>
                        ) : contents.length === 0 ? (
                            <div className={styles.noLessons}>No content available. Add new content to get started!</div>
                        ) : (
                            <ul className={styles.contentItems}>
                                {contents.map((content) => (
                                    <li
                                        key={content.contentId}
                                        className={`${styles.contentItem} ${selectedContentId === content.contentId ? styles.contentItemActive : ''}`}
                                        onClick={() => handleContentClick(content.contentId)}
                                    >
                                        <div className={styles.contentItemContent}>
                                            <h4>{content.title}</h4>
                                            <p>Type: {content.contentType}</p>
                                            <div className={styles.contentItemActions}>
                                                <button
                                                    className={`${styles.btn} ${styles.btnWarning} ${styles.btnSm}`}
                                                    onClick={() => handleEditClick(content.contentId)}
                                                    aria-label={`Edit content ${content.title}`}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                    onClick={() => handleDeleteClick(content.contentId)}
                                                    aria-label={`Delete content ${content.title}`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Right Side: Content Player */}
                    <div className={styles.playerContainer}>
                        <h3 className={styles.contentListTitle}>
                            {selectedContent ? selectedContent.title : 'Select a Content'}
                        </h3>
                        {loadingPlayer ? (
                            <div className={styles.loading}>Loading content...</div>
                        ) : selectedContentId ? (
                            renderContent()
                        ) : (
                            <div className={styles.noLessons}>Select a content to view.</div>
                        )}
                    </div>
                </div>

                {showDeleteConfirm && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h5>Xác nhận xóa nội dung</h5>
                                <button className={styles.modalClose} onClick={handleDeleteCancel} aria-label="Close">
                                    ×
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <p>Bạn có chắc chắn muốn xóa nội dung này không?</p>
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleDeleteCancel}>
                                    Hủy
                                </button>
                                <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleDeleteConfirm}>
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditModal && (
                    <div className={styles.modal} onClick={closeEditModal}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <EditLessonContentPage
                                showModal={showEditModal}
                                closeModal={closeEditModal}
                                contentId={editContentId}
                                lessonId={lessonId}
                                courseId={courseId}
                                onContentUpdated={handleContentUpdated}
                            />
                        </div>
                    </div>
                )}

                {showAddModal && (
                    <div className={styles.modal} onClick={closeAddModal}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <AddLessonContentPage
                                showModal={showAddModal}
                                closeModal={closeAddModal}
                                lessonId={lessonId}
                                courseId={courseId}
                                onContentAdded={handleContentAdded}
                            />
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
};

export default LessonContentPage;
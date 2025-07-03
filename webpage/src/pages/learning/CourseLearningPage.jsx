import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/LearningPage.module.css';
import ReactPlayer from 'react-player';
import { Document, Page, pdfjs } from 'react-pdf';

// Ensure PDF worker is properly initialized
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function CourseLearningPage() {
	const { courseId } = useParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [course, setCourse] = useState(null);
	const [lessons, setLessons] = useState([]);
	const [openLesson, setOpenLesson] = useState(null); // lessonId
	const [lessonContents, setLessonContents] = useState({}); // lessonId -> [contents]
	const [selectedContent, setSelectedContent] = useState(null); // content object
	const [currentLesson, setCurrentLesson] = useState(null); // current lesson object
	const [pdfPage, setPdfPage] = useState(1);
	const [numPages, setNumPages] = useState(null);
	const [lastLoadedContentId, setLastLoadedContentId] = useState(null);
	const pdfContainerRef = useRef(null);
	const [pdfWidth, setPdfWidth] = useState(600);
	const [activeTab, setActiveTab] = useState('lessons');
	const [quizzes, setQuizzes] = useState([]);
	const [quizLoading, setQuizLoading] = useState(false);
	const [quizError, setQuizError] = useState(null);
	const [selectedQuiz, setSelectedQuiz] = useState(null);
	const [quizHistory, setQuizHistory] = useState([]);
	const [quizHistoryLoading, setQuizHistoryLoading] = useState(false);
	const [quizHistoryError, setQuizHistoryError] = useState(null);
	const [childId, setChildId] = useState(null);
	const [fileBuffer, setFileBuffer] = useState(null); // For PDF ArrayBuffer
	const [pageNumber, setPageNumber] = useState(1); // For PDF page navigation
	const [pdfLoading, setPdfLoading] = useState(false);
	const [pdfError, setPdfError] = useState(null);
	const [pdfKey, setPdfKey] = useState(0); // Key to force re-render
	const [completingLesson, setCompletingLesson] = useState(false); // Loading state for complete button

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				// const courseRes = await axios.get(`/api/courses/${courseId}`);
				// setCourse(courseRes.data);
				const lessonsRes = await axios.get(`/api/lessons/course/${courseId}`);
				setLessons(lessonsRes.data);
			} catch (err) {
				setError('Failed to load course or lessons.');
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [courseId]);

	useEffect(() => {
		// Set PDF width to fit container
		function updatePdfWidth() {
			if (pdfContainerRef.current) {
				setPdfWidth(pdfContainerRef.current.offsetWidth);
			}
		}
		updatePdfWidth();
		window.addEventListener('resize', updatePdfWidth);
		return () => window.removeEventListener('resize', updatePdfWidth);
	}, [selectedContent]);

	useEffect(() => {
		if (activeTab === 'quiz') {
			setQuizLoading(true);
			setQuizError(null);
			axios.get(`/api/quizzes/course/${courseId}`)
				.then(res => setQuizzes(res.data))
				.catch(() => setQuizError('Failed to load quizzes.'))
				.finally(() => setQuizLoading(false));
		}
	}, [activeTab, courseId]);

	useEffect(() => {
		// Fetch childId for quiz history
		axios.get('/api/hocho/profile', { withCredentials: true })
			.then(res => setChildId(res.data.id))
			.catch(() => setChildId(null));
	}, []);

	useEffect(() => {
		if (selectedQuiz && childId) {
			setQuizHistoryLoading(true);
			setQuizHistoryError(null);
			axios.get(`/api/quizzes/${selectedQuiz.quizId}/child/${childId}/result`)
				.then(res => {
					// If the API returns a single result, wrap in array for consistency
					setQuizHistory(Array.isArray(res.data) ? res.data : [res.data]);
				})
				.catch(() => setQuizHistoryError('Failed to load quiz history.'))
				.finally(() => setQuizHistoryLoading(false));
		} else {
			setQuizHistory([]);
		}
	}, [selectedQuiz, childId]);

	// Cleanup effect for PDF buffer
	useEffect(() => {
		return () => {
			// Cleanup when component unmounts
			setFileBuffer(null);
		};
	}, []);

	// Effect to recreate PDF buffer when switching back to lessons tab
	useEffect(() => {
		if (activeTab === 'lessons' && selectedContent && selectedContent.contentType === 'PDF' && selectedContent.contentData) {
			try {
				setPdfLoading(true);
				setPdfError(null);
				const buffer = createFreshArrayBuffer(selectedContent.contentData);
				setFileBuffer(buffer);
				setPageNumber(1);
				setPdfKey(prev => prev + 1); // Force re-render
			} catch (err) {
				console.error('Error recreating PDF buffer:', err);
				setPdfError('Failed to load PDF file.');
				setFileBuffer(null);
			} finally {
				setPdfLoading(false);
			}
		}
	}, [activeTab, selectedContent]);

	const handleToggleLesson = async (lessonId) => {
		setOpenLesson(openLesson === lessonId ? null : lessonId);
		if (!lessonContents[lessonId]) {
			try {
				const res = await axios.get(`/api/lesson-contents/${lessonId}`);
				setLessonContents(prev => ({ ...prev, [lessonId]: res.data }));
			} catch (err) {
				setLessonContents(prev => ({ ...prev, [lessonId]: [] }));
			}
		}
	};

	const handleSelectContent = (content) => {
		setSelectedContent(content);
		
		// Tìm lesson chứa content này
		const lesson = lessons.find(lesson => 
			lessonContents[lesson.lessonId]?.some(c => c.contentId === content.contentId)
		);
		setCurrentLesson(lesson);
		
		if (content.contentType === 'PDF' && content.contentData) {
			try {
				setPdfLoading(true);
				setPdfError(null);
				const buffer = createFreshArrayBuffer(content.contentData);
				setFileBuffer(buffer);
				setPageNumber(1); // Reset to first page on new PDF
				setPdfKey(prev => prev + 1); // Force re-render
			} catch (err) {
				console.error('Error creating PDF buffer:', err);
				setPdfError('Failed to load PDF file.');
				setFileBuffer(null);
			} finally {
				setPdfLoading(false);
			}
		} else {
			setFileBuffer(null);
			setPdfError(null);
		}
	};

	const handleCompleteLesson = async () => {
		if (!currentLesson || !childId) {
			alert('Cannot complete the lesson. Please try again.');
			return;
		}

		setCompletingLesson(true);
		try {
			await axios.post(`/api/parent/learning-progress/child/${childId}/lesson/${currentLesson.lessonId}/complete`, {}, {
				withCredentials: true
			});
			alert('Congratulations! You have completed this lesson.');
		} catch (error) {
			console.error('Error completing lesson:', error);
			alert('An error occurred while completing the lesson. Please try again.');
		} finally {
			setCompletingLesson(false);
		}
	};

	const onDocumentLoadSuccess = ({ numPages: n }) => {
		setNumPages(n);
		setPdfLoading(false);
		setPdfError(null);
		// Only reset to page 1 if a new document is loaded
		if (!lastLoadedContentId || (selectedContent && lastLoadedContentId !== selectedContent.contentId)) {
			setPageNumber(1);
			if (selectedContent) setLastLoadedContentId(selectedContent.contentId);
		}
	};

	const onDocumentLoadError = (error) => {
		console.error('PDF load error:', error);
		setPdfError('Failed to load PDF file.');
		setPdfLoading(false);
	};

	function createFreshArrayBuffer(base64) {
		const binaryString = window.atob(base64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		// Create a fresh copy to avoid detached buffer issues
		return bytes.slice().buffer;
	}

	function getDownloadUrl(content) {
		if (!content || !content.contentData) return null;
		const buffer = createFreshArrayBuffer(content.contentData);
		let mime = 'application/octet-stream';
		let ext = '';
		if (content.contentType === 'VIDEO') {
			mime = 'video/mp4';
			ext = '.mp4';
		} else if (content.contentType === 'PDF') {
			mime = 'application/pdf';
			ext = '.pdf';
		}
		const blob = new Blob([buffer], { type: mime });
		return {
			url: URL.createObjectURL(blob),
			filename: (content.title || 'lesson') + ext
		};
	}

	if (loading) {
		return <div className={styles.learningPageContainer}><div style={{padding: 32, textAlign: 'center'}}>Loading...</div></div>;
	}
	if (error) {
		return <div className={styles.learningPageContainer}><div style={{padding: 32, color: 'red', textAlign: 'center'}}>{error}</div></div>;
	}

	return (
		<div className={styles.courseLessonsPageContainer}>
			<div className={styles.courseLessonsTitle}></div>
			<div className={styles.courseLessonsTabs}>
		<span
			className={activeTab === 'lessons' ? styles.activeTab : styles.inactiveTab}
			onClick={() => setActiveTab('lessons')}
		>Lessons</span>
				<span
					className={activeTab === 'quiz' ? styles.activeTab : styles.inactiveTab}
					onClick={() => setActiveTab('quiz')}
				>Quiz</span>
			</div>
			<div className={styles.courseLessonsMain}>
				{activeTab === 'lessons' ? (
					<div className={styles.courseLessonsLeft}>
						{lessons.map(lesson => (
							<div key={lesson.lessonId} className={styles.lessonAccordion}>
								<div
									className={styles.lessonAccordionHeader}
									onClick={() => handleToggleLesson(lesson.lessonId)}
								>
									{lesson.title}
									<span className={styles.lessonAccordionArrow}>{openLesson === lesson.lessonId ? '▲' : '▼'}</span>
								</div>
								{openLesson === lesson.lessonId && (
									<div className={styles.lessonAccordionContent}>
										{(lessonContents[lesson.lessonId] || []).map(content => (
											<div
												key={content.contentId}
												className={styles.lessonContentLink}
												onClick={() => handleSelectContent(content)}
												style={{ color: selectedContent && selectedContent.contentId === content.contentId ? '#1967d2' : '#174ea6', fontWeight: selectedContent && selectedContent.contentId === content.contentId ? 600 : 400 }}
											>
												{content.title} ({content.contentType})
											</div>
										))}
										{(lessonContents[lesson.lessonId] && lessonContents[lesson.lessonId].length === 0) && (
											<div className={styles.lessonContentEmpty}>No content.</div>
										)}
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<div className={styles.courseLessonsLeft}>
						{quizLoading ? (
							<div style={{ padding: 24, textAlign: 'center' }}>Loading quizzes...</div>
						) : quizError ? (
							<div style={{ color: 'red', padding: 24 }}>{quizError}</div>
						) : quizzes.length === 0 ? (
							<div style={{ color: '#888', fontStyle: 'italic', padding: 24 }}>No quizzes for this course.</div>
						) : (
							<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
								{quizzes.map(quiz => (
									<li
										key={quiz.quizId}
										style={{
											padding: '10px 0',
											borderBottom: '1px solid #e5e7eb',
											background: selectedQuiz && selectedQuiz.quizId === quiz.quizId ? '#e6f7ff' : 'transparent',
											cursor: 'pointer',
											fontWeight: selectedQuiz && selectedQuiz.quizId === quiz.quizId ? 600 : 400,
											color: selectedQuiz && selectedQuiz.quizId === quiz.quizId ? '#1967d2' : '#174ea6',
										}}
										onClick={() => setSelectedQuiz(quiz)}
									>
										{quiz.title}
									</li>
								))}
							</ul>
						)}
					</div>
				)}
				<div className={styles.courseLessonsRight} ref={pdfContainerRef}>
					{activeTab === 'lessons' ? (
						selectedContent ? (
							<div className={styles.lessonContentDisplayBox}>
								<div className={styles.lessonContentTitle}>{selectedContent.title} ({selectedContent.contentType})</div>
								{currentLesson && (
									<div style={{ marginBottom: '16px', padding: '8px 12px', background: '#f0f8ff', borderRadius: '6px', border: '1px solid #b3d9ff' }}>
										<strong>Bài học:</strong> {currentLesson.title}
									</div>
								)}
								{selectedContent.contentType === 'VIDEO' && selectedContent.contentData && (
									<div style={{ maxWidth: 600 }}>
										<ReactPlayer
											url={URL.createObjectURL(new Blob([createFreshArrayBuffer(selectedContent.contentData)], { type: 'video/mp4' }))}
											controls
											width="100%"
											height="auto"
										/>
									</div>
								)}
								{selectedContent && selectedContent.contentType === 'PDF' && (
									<div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
										{pdfLoading ? (
											<div style={{ textAlign: 'center', padding: '20px' }}>Loading PDF...</div>
										) : pdfError ? (
											<div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{pdfError}</div>
										) : fileBuffer ? (
											<>
												<Document
													key={`pdf-${pdfKey}-${selectedContent.contentId}`}
													file={fileBuffer}
													onLoadSuccess={onDocumentLoadSuccess}
													onLoadError={onDocumentLoadError}
													loading={<div style={{ textAlign: 'center', padding: '20px' }}>Loading PDF...</div>}
													error={<div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Failed to load PDF file.</div>}
													noData={<div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>No PDF file provided.</div>}
												>
													<Page 
														pageNumber={pageNumber} 
														width={pdfWidth - 32}
														loading={<div style={{ textAlign: 'center', padding: '10px' }}>Loading page...</div>}
														error={<div style={{ color: 'red', textAlign: 'center', padding: '10px' }}>Failed to load page.</div>}
													/>
												</Document>
												<div style={{ textAlign: 'center', marginTop: '16px' }}>
													<button
														disabled={pageNumber <= 1}
														onClick={() => setPageNumber(pageNumber - 1)}
													>
														Previous
													</button>
													<span style={{ margin: '0 12px' }}>
														Page {pageNumber} of {numPages || '?'}
													</span>
													<button
														disabled={pageNumber >= (numPages || 1)}
														onClick={() => setPageNumber(pageNumber + 1)}
													>
														Next
													</button>
												</div>
											</>
										) : (
											<div style={{ textAlign: 'center', padding: '20px' }}>No PDF file available.</div>
										)}
									</div>
								)}
								{/* Download button for VIDEO or PDF */}
								{(selectedContent.contentType === 'VIDEO' || selectedContent.contentType === 'PDF') && (
									(() => {
										const download = getDownloadUrl(selectedContent);
										return download ? (
											<div style={{ marginTop: 16, textAlign: 'center' }}>
												<a href={download.url} download={download.filename}>
													<button style={{
														background: '#1967d2',
														color: '#fff',
														border: 'none',
														borderRadius: 6,
														padding: '10px 28px',
														fontSize: '1rem',
														fontWeight: 600,
														cursor: 'pointer'
													}}>
														Download {selectedContent.contentType === 'VIDEO' ? 'Video' : 'PDF'}
													</button>
												</a>
											</div>
										) : null;
									})()
								)}
								{selectedContent.contentType !== 'VIDEO' && selectedContent.contentType !== 'PDF' && (
									<div style={{ color: '#888', fontStyle: 'italic' }}>Unsupported content type</div>
								)}
								
								{/* Nút hoàn thành bài học */}
								{currentLesson && (
									<div style={{ marginTop: '24px', textAlign: 'center' }}>
										<button
											onClick={handleCompleteLesson}
											disabled={completingLesson}
											style={{
												background: completingLesson ? '#ccc' : '#28a745',
												color: 'white',
												border: 'none',
												borderRadius: '8px',
												padding: '12px 24px',
												fontSize: '1rem',
												fontWeight: '600',
												cursor: completingLesson ? 'not-allowed' : 'pointer',
												transition: 'background-color 0.3s ease',
												boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
											}}
											onMouseEnter={(e) => {
												if (!completingLesson) {
													e.target.style.background = '#218838';
												}
											}}
											onMouseLeave={(e) => {
												if (!completingLesson) {
													e.target.style.background = '#28a745';
												}
											}}
										>
											{completingLesson ? 'Processing...' : '✅ Complete Lesson'}
										</button>
										<p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
											Click this button to mark that you have completed the lesson "{currentLesson.title}"
										</p>
									</div>
								)}
							</div>
						) : (
							<div className={styles.lessonContentDisplayBox} style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: 32 }}>
								Select a lesson content to view.
							</div>
						)
					) : (
						selectedQuiz ? (
							<div className={styles.lessonContentDisplayBox}>
								<div className={styles.lessonContentTitle}>{selectedQuiz.title}</div>
								<div style={{ margin: '16px 0', fontSize: '1.08rem' }}>
									<div><b>Max Score:</b> {selectedQuiz.totalPoints}</div>
									<div><b>Time Limit:</b> {selectedQuiz.timeLimit} minutes</div>
								</div>
								<button
									style={{
										background: '#1967d2',
										color: '#fff',
										border: 'none',
										borderRadius: 6,
										padding: '10px 28px',
										fontSize: '1.08rem',
										fontWeight: 600,
										cursor: 'pointer',
										marginTop: 12,
									}}
									onClick={() => window.location.href = `/hocho/quizzes/${selectedQuiz.quizId}/do`}
								>
									Take Quiz
								</button>
								<div style={{ marginTop: 24 }}>
									<h4 style={{ marginBottom: 8 }}>Quiz History</h4>
									{quizHistoryLoading ? (
										<div>Loading history...</div>
									) : quizHistoryError ? (
										<div style={{ color: 'red' }}>{quizHistoryError}</div>
									) : quizHistory.length === 0 ? (
										<div style={{ color: '#888', fontStyle: 'italic' }}>No attempts yet.</div>
									) : (
										<ul style={{ listStyle: 'none', padding: 0 }}>
											{quizHistory.map((attempt, idx) => (
												<li key={attempt.resultId || idx} style={{ marginBottom: 10, background: '#f5f7fa', borderRadius: 6, padding: 10 }}>
													<div><b>Score:</b> {attempt.score}</div>
													<div><b>Date:</b> {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'}</div>
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
						) : (
							<div className={styles.lessonContentDisplayBox} style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: 32 }}>
								Select a quiz to view its info.
							</div>
						)
					)}
				</div>
			</div>
		</div>
	);
}

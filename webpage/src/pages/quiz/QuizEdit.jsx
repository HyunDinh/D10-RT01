import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from 'react-router-dom';
import formStyles from '../../styles/quiz/QuizForm.module.css';
import addLessonStyles from '../../styles/lesson/AddLesson.module.css';
import * as XLSX from 'xlsx';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';

const QuizEdit = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [inputMode, setInputMode] = useState('excel'); // 'excel' or 'manual'
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
    const [showDeleteQuestionModal, setShowDeleteQuestionModal] = useState(false);
    const [deleteQuestionIndex, setDeleteQuestionIndex] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/quizzes/${id}`, {
                withCredentials: true,
            });
            setQuiz(res.data);
            setLoading(false);
            // Select the first question by default if available
            if (res.data.questions.length > 0) {
                setSelectedQuestionIndex(0);
            }
        } catch (err) {
            setError('Không thể tải thông tin quiz');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setQuiz((prev) => ({
            ...prev, [e.target.name]: e.target.value,
        }));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[index] = {
            ...newQuestions[index], [field]: value,
        };
        setQuiz((prev) => ({
            ...prev, questions: newQuestions,
        }));
    };

    const handleOptionChange = (questionIndex, optionIndex, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[questionIndex].options[optionIndex] = {
            ...newQuestions[questionIndex].options[optionIndex], [field]: value,
        };
        setQuiz((prev) => ({
            ...prev, questions: newQuestions,
        }));
    };

    const handleImageUpload = async (questionIndex, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('imageFile', file);

        try {
            const res = await axios.post('http://localhost:8080/api/quizzes/upload-image', formData, {
                headers: {'Content-Type': 'multipart/form-data'}, withCredentials: true,
            });
            handleQuestionChange(questionIndex, 'questionImageUrl', res.data.imageUrl);
        } catch (err) {
            setError('Upload ảnh thất bại!');
        }
    };

    const addQuestion = () => {
        setQuiz((prev) => ({
            ...prev, questions: [...prev.questions, {
                questionText: '',
                points: 10,
                options: [{optionText: '', optionKey: 'A'}, {optionText: '', optionKey: 'B'}, {
                    optionText: '',
                    optionKey: 'C'
                }, {optionText: '', optionKey: 'D'},],
                correctOptionId: 'A',
            },],
        }));
        setSelectedQuestionIndex(quiz.questions.length); // Select the new question
    };

    const handleDeleteQuestionClick = (index) => {
        setDeleteQuestionIndex(index);
        setShowDeleteQuestionModal(true);
    };

    const handleDeleteQuestionCancel = () => {
        const modal = document.querySelector(`.${addLessonStyles.modal}`);
        const modalContent = document.querySelector(`.${addLessonStyles.modalContent}`);
        if (modal && modalContent) {
            modal.classList.add('closing');
            modalContent.classList.add('closing');
            setTimeout(() => {
                setShowDeleteQuestionModal(false);
                setDeleteQuestionIndex(null);
            }, 300);
        } else {
            setShowDeleteQuestionModal(false);
            setDeleteQuestionIndex(null);
        }
    };

    const handleDeleteQuestionConfirm = () => {
        setQuiz((prev) => ({
            ...prev, questions: prev.questions.filter((_, i) => i !== deleteQuestionIndex),
        }));
        setShowDeleteQuestionModal(false);
        if (selectedQuestionIndex >= quiz.questions.length - 1) {
            setSelectedQuestionIndex(quiz.questions.length - 2 >= 0 ? quiz.questions.length - 2 : null);
        }
        setDeleteQuestionIndex(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (quiz.questions.length === 0) {
            setError('Vui lòng thêm ít nhất một câu hỏi');
            return;
        }

        setSaving(true);
        try {
            await axios.put(`http://localhost:8080/api/quizzes/${id}`, quiz, {
                withCredentials: true,
            });
            navigate(`/hocho/teacher/quizzes/${id}`);
        } catch (err) {
            setError('Không thể cập nhật quiz');
            setSaving(false);
        }
    };

    const getQuizImageUrl = (questionImageUrl) => {
        const baseUrl = 'http://localhost:8080';
        if (!questionImageUrl || questionImageUrl === 'none') {
            return '/images/default-quiz.jpg';
        }
        const fileName = questionImageUrl.split('/').pop();
        return `${baseUrl}/api/quizzes/image/${fileName}?t=${new Date().getTime()}`;
    };

    const handleExcelFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, {header: 1});

            const [header, ...rows] = json;
            const newQuestions = rows.map((row) => ({
                questionText: row[0] || '',
                points: Number(row[6]) || 10,
                options: [{optionText: row[1] || '', optionKey: 'A'}, {
                    optionText: row[2] || '',
                    optionKey: 'B'
                }, {optionText: row[3] || '', optionKey: 'C'}, {optionText: row[4] || '', optionKey: 'D'},],
                correctOptionId: row[5] || 'A',
            }));
            setQuiz((prev) => ({
                ...prev, questions: [...prev.questions, ...newQuestions],
            }));
            setSelectedQuestionIndex(quiz.questions.length); // Select the first new question
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([['Câu hỏi', 'A', 'B', 'C', 'D', 'Đáp án đúng', 'Điểm'], ['2+2=?', '3', '4', '5', '6', 'B', '10'], ['Thủ đô Việt Nam?', 'Hà Nội', 'Sài Gòn', 'Huế', 'Đà Nẵng', 'A', '10'],]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'quiz_template.xlsx');
    };

    const renderQuestionForm = () => {
        if (selectedQuestionIndex === null || !quiz.questions[selectedQuestionIndex]) {
            return <div className={formStyles.noQuestion}>Vui lòng chọn hoặc thêm một câu hỏi để chỉnh sửa.</div>;
        }
        const question = quiz.questions[selectedQuestionIndex];

        return (<div className={formStyles.quizDetailQuestionCard}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                    <div className={formStyles.quizDetailQuestionTitle}>Câu {selectedQuestionIndex + 1}</div>
                    <button
                        className={formStyles.quizFormRemoveBtn}
                        onClick={() => handleDeleteQuestionClick(selectedQuestionIndex)}
                    >`
                        <FontAwesomeIcon icon={faTrash}/> Xóa
                    </button>
                </div>
                <div>
                    <label className={formStyles.quizFormLabel}>Nội dung câu hỏi</label>
                    <textarea
                        className={formStyles.quizFormTextarea}
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(selectedQuestionIndex, 'questionText', e.target.value)}
                        rows={2}
                    />
                </div>
                <div>
                    <label className={formStyles.quizFormLabel}>Ảnh minh họa (tùy chọn)</label>
                    <input
                        type="file"
                        className={formStyles.quizFormInput}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(selectedQuestionIndex, e.target.files[0])}
                    />
                    {question.questionImageUrl && (<img
                            src={getQuizImageUrl(question.questionImageUrl)}
                            alt="Ảnh minh họa"
                            className={formStyles.quizDetailQuestionImage}
                            onError={(e) => (e.target.src = '/images/default-quiz.jpg')}
                        />)}
                </div>
                <div className={formStyles.quizFormRow}>
                    {question.options.map((opt, idx) => (<div className={formStyles.quizFormCol} key={opt.optionKey}>
                            <label className={formStyles.quizFormLabel}>Đáp án {opt.optionKey}</label>
                            <input
                                type="text"
                                className={formStyles.quizFormInput}
                                value={opt.optionText}
                                onChange={(e) => handleOptionChange(selectedQuestionIndex, idx, 'optionText', e.target.value)}
                            />
                        </div>))}
                </div>
                <div>
                    <label className={formStyles.quizFormLabel}>Đáp án đúng</label>
                    <select
                        className={formStyles.quizFormSelect}
                        value={question.correctOptionId}
                        onChange={(e) => handleQuestionChange(selectedQuestionIndex, 'correctOptionId', e.target.value)}
                    >
                        {question.options.map((opt) => (<option key={opt.optionKey} value={opt.optionKey}>
                                {opt.optionKey}
                            </option>))}
                    </select>
                </div>
                <div>
                    <label className={formStyles.quizFormLabel}>Điểm</label>
                    <input
                        type="number"
                        className={formStyles.quizFormInput}
                        value={question.points}
                        min="1"
                        onChange={(e) => handleQuestionChange(selectedQuestionIndex, 'points', e.target.value)}
                        required
                    />
                </div>
            </div>);
    };

    if (loading) {
        return <div className={formStyles.quizDetailAlert}>Đang tải...</div>;
    }

    if (error) {
        return <div className={formStyles.quizDetailAlert}>{error}</div>;
    }

    if (!quiz) {
        return null;
    }

    return (<>
            <main className={formStyles.quizFormContainer}>
                <h2 className={formStyles.quizFormTitle}>Chỉnh sửa Quiz</h2>
                <form className={formStyles.quizForm} onSubmit={handleSubmit}>
                    <div>
                        <label className={formStyles.quizFormLabel}>Tiêu đề</label>
                        <input
                            type="text"
                            className={formStyles.quizFormInput}
                            name="title"
                            value={quiz.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className={formStyles.quizFormLabel}>Mô tả</label>
                        <textarea
                            className={formStyles.quizFormTextarea}
                            name="description"
                            value={quiz.description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className={formStyles.quizFormRow}>
                        <div className={formStyles.quizFormCol}>
                            <label className={formStyles.quizFormLabel}>Thời gian (phút)</label>
                            <input
                                type="number"
                                className={formStyles.quizFormInput}
                                name="timeLimit"
                                value={quiz.timeLimit}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                        <div className={formStyles.quizFormCol}>
                            <label className={formStyles.quizFormLabel}>Tổng điểm</label>
                            <input
                                type="number"
                                className={formStyles.quizFormInput}
                                name="totalPoints"
                                value={quiz.totalPoints}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className={formStyles.splitContainer}>
                        {/* Left Side: Question List */}
                        <div className={formStyles.questionList}>
                            <h3 className={formStyles.questionListTitle}>Danh sách câu hỏi</h3>
                            {quiz.questions.length === 0 ? (
                                <div className={formStyles.noQuestion}>Không có câu hỏi nào.</div>) : (
                                <ul className={formStyles.questionItems}>
                                    {quiz.questions.map((question, index) => (<li
                                            key={index}
                                            className={`${formStyles.questionItem} ${selectedQuestionIndex === index ? formStyles.questionItemActive : ''}`}
                                            onClick={() => setSelectedQuestionIndex(index)}
                                        >
                                            <div className={formStyles.quizDetailQuestionTitle}>
                                                Câu {index + 1}: {question.questionText || 'Chưa nhập nội dung'}
                                            </div>
                                        </li>))}
                                </ul>)}
                        </div>

                        {/* Right Side: Question Edit Form */}
                        <div className={formStyles.questionDetailContainer}>
                            <h3 className={formStyles.questionListTitle}>Chỉnh sửa câu hỏi</h3>
                            {renderQuestionForm()}
                        </div>
                    </div>

                    <div style={{margin: '24px 0'}}>
                        <div style={{margin: '16px 0'}}>
                            <label>
                                <input
                                    type="radio"
                                    name="inputMode"
                                    value="excel"
                                    checked={inputMode === 'excel'}
                                    onChange={() => setInputMode('excel')}
                                />
                                Thêm câu hỏi từ file Excel
                            </label>
                            <label style={{marginLeft: 24}}>
                                <input
                                    type="radio"
                                    name="inputMode"
                                    value="manual"
                                    checked={inputMode === 'manual'}
                                    onChange={() => setInputMode('manual')}
                                />
                                Thêm câu hỏi trực tiếp trên web
                            </label>
                        </div>
                        {inputMode === 'excel' && (
                            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleExcelFile}
                                    className={formStyles.quizFormInput}
                                />
                                <button
                                    type="button"
                                    className={formStyles.quizFormAddBtn}
                                    onClick={downloadTemplate}
                                >
                                    Tải file mẫu
                                </button>
                            </div>)}
                        {inputMode === 'manual' && (<button
                                type="button"
                                className={formStyles.quizFormAddBtn}
                                onClick={addQuestion}
                            >
                                Thêm câu hỏi
                            </button>)}
                    </div>
                    <button
                        type="submit"
                        className={formStyles.quizFormSubmitBtn}
                        disabled={saving}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu Quiz'}
                    </button>
                </form>

                {showDeleteQuestionModal && (<div className={addLessonStyles.modal}>
                        <div className={addLessonStyles.modalContent}>
                            <div className={addLessonStyles.modalHeader}>
                                <h5>Xác nhận xóa câu hỏi</h5>
                                <button
                                    className={addLessonStyles.modalClose}
                                    onClick={handleDeleteQuestionCancel}
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                            <div className={addLessonStyles.modalBody}>
                                <p>Bạn có chắc chắn muốn xóa câu hỏi này không?</p>
                            </div>
                            <div className={addLessonStyles.modalFooter}>
                                <button
                                    className={`${addLessonStyles.btn} ${addLessonStyles.btnSecondary}`}
                                    onClick={handleDeleteQuestionCancel}
                                >
                                    Hủy
                                </button>
                                <button
                                    className={`${addLessonStyles.btn} ${addLessonStyles.btnSuccess}`}
                                    onClick={handleDeleteQuestionConfirm}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>)}
            </main>
        </>);
};

export default QuizEdit;
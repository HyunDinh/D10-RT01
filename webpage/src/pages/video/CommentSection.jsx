import React, {useEffect, useRef, useState} from "react";
import {message} from "antd";
import styles from "../../styles/video/VideoPlayer.module.css";
import DeleteConfirmDialog from "../../components/DeleteConfirmDialog.jsx";
import { useTranslation } from 'react-i18next';

const CommentSection = ({videoId, playerRef, playedSecondsRef}) => {
    const { t } = useTranslation();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            message.warning(t('video_comments_submit_empty'));
            return;
        }
        const mockComment = {
            commentId: Date.now(),
            content: newComment,
            // thay the ten profile comment
            createdBy: {fullName: '@user'},
            createdAt: new Date().toISOString(),
        };
        setComments([...comments, mockComment]);
        setNewComment('');
        message.success(t('video_comments_add_success'));
        setIsTyping(false); // Resume video after submission
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
        if (!isTyping) {
            if (playerRef.current) {
                playedSecondsRef.current = playerRef.current.getCurrentTime();
            }
            setIsTyping(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 500);
    };

    const handleCommentBlur = () => {
        if (!newComment.trim()) {
            setIsTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    // Pass isTyping back to parent via a ref or prop if needed
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={styles.videoDetailComments}>
            <h3 className={styles.videoDetailCommentsTitle}>{t('video_comments_title')}</h3>
            <form className={styles.videoDetailCommentForm} onSubmit={handleCommentSubmit}>
                <textarea
                    className={styles.videoDetailCommentInput}
                    value={newComment}
                    onChange={handleCommentChange}
                    onBlur={handleCommentBlur}
                    placeholder={t('video_comments_placeholder')}
                    aria-label={t('video_comments_aria')}
                    rows="4"
                />
                <button type="submit" className={styles.videoDetailCommentButton}>
                    {t('video_comments_send_button')}
                </button>
            </form>
            <ul className={styles.videoDetailCommentList}>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <li key={comment.commentId} className={styles.videoDetailCommentItem}>
                            <p className={styles.videoDetailCommentAuthor}>{comment.createdBy.fullName}</p>
                            <p className={styles.videoDetailCommentContent}>{comment.content}</p>
                            <p className={styles.videoDetailCommentDate}>
                                {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </li>
                    ))
                ) : (
                    <p className={styles.videoDetailNoComments} aria-live="polite">
                        {t('video_comments_no_comments')}
                    </p>
                )}
            </ul>
        </div>
    );
};
export default CommentSection;
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {debounce} from 'lodash';
import styles from '../../styles/Messaging.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CreateChatModal from './CreateChatModal';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faComment, faPaperclip} from '@fortawesome/free-solid-svg-icons';
import {useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

/**
 * @typedef {Object} Message
 * @property {number} messageId
 * @property {Object} chatSession
 * @property {number} chatSession.sessionId
 * @property {Object} sender
 * @property {number} sender.id
 * @property {Object} receiver
 * @property {number} receiver.id
 * @property {string} content
 * @property {string} messageType
 * @property {boolean} isRead
 * @property {string} createdAt
 * @property {string|null} fileUrl
 * @property {string|null} fileType
 * @property {boolean} isDelivered
 */

const MessagingPage = () => {
    const [chatSessions, setChatSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const location = useLocation();
    const [preselectedTeacher, setPreselectedTeacher] = useState(null);
    const stompClientRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const messagesContainerRef = useRef(null);
    const {t} = useTranslation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/hocho/profile', {
                    withCredentials: true
                });
                setCurrentUser(response.data);
                console.log('Đã tải currentUser:', JSON.stringify(response.data, null, 2));
                fetchChatSessions();
            } catch (error) {
                console.error('Lỗi khi tải thông tin người dùng:', error);
                if (error.response?.status === 401) {
                    alert('Vui lòng đăng nhập lại để tiếp tục.');
                    window.location.href = '/login';
                }
            }
        };
        checkAuth();
        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                console.log('Ngắt kết nối WebSocket');
                stompClientRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (currentUser?.id) {
            console.log('Bắt đầu kết nối WebSocket cho user:', currentUser.id);
            connectWebSocket();
        }
    }, [currentUser]);

    useEffect(() => {
        if (selectedSession) {
            fetchMessages(selectedSession.sessionId);
        }
    }, [selectedSession]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (selectedSession && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && !lastMessage.isRead && lastMessage.sender.id !== currentUser?.id) {
                markAsReadDebounced(selectedSession.sessionId, currentUser.id, lastMessage.messageId);
            }
        }
    }, [selectedSession, messages, currentUser]);

    useEffect(() => {
        if (location.state?.teacherId && chatSessions.length > 0 && currentUser) {
            const existingSession = chatSessions.find((s) => s.user1.id === location.state.teacherId || s.user2.id === location.state.teacherId);
            if (existingSession) {
                setSelectedSession(existingSession);
            } else {
                setShowCreateModal(true);
                setPreselectedTeacher({
                    id: location.state.teacherId,
                    fullName: location.state.teacherName,
                    avatarUrl: location.state.teacherAvatarUrl
                });
            }
        }
    }, [location.state, chatSessions, currentUser]);

    const connectWebSocket = () => {
        if (!currentUser) {
            console.warn('currentUser chưa được tải, không thể kết nối WebSocket');
            return;
        }
        console.log('Đang kết nối WebSocket... User ID:', currentUser.id);
        const socket = new SockJS('http://localhost:8080/ws');
        stompClientRef.current = Stomp.over(socket);

        // Hủy subscription cũ nếu có
        if (stompClientRef.current.subscriptions) {
            Object.keys(stompClientRef.current.subscriptions).forEach((subId) => {
                stompClientRef.current.unsubscribe(subId);
                console.log(`Hủy subscription: ${subId}`);
            });
        }

        stompClientRef.current.connect({withCredentials: true}, () => {
            console.log('Kết nối WebSocket thành công! User ID:', currentUser.id);
            console.log('Subscribe vào queue: /user/' + currentUser.id + '/queue/messages');
            const subscription = stompClientRef.current.subscribe(`/user/${currentUser.id}/queue/messages`, async (message) => {
                console.log('Nhận tin nhắn WebSocket:', message.body);
                try {
                    /** @type {Message} */
                    const newMessage = JSON.parse(message.body);
                    console.log('Parsed newMessage:', JSON.stringify(newMessage, null, 2));
                    console.log('Current selectedSession:', JSON.stringify(selectedSession, null, 2));
                    console.log('So sánh sessionId:', {
                        newMessageSessionId: newMessage.chatSession.sessionId,
                        selectedSessionId: selectedSession?.sessionId,
                        types: {
                            newMessageSessionId: typeof newMessage.chatSession.sessionId,
                            selectedSessionId: typeof selectedSession?.sessionId
                        }
                    });

                    // Kiểm tra messageId tồn tại
                    if (!newMessage.messageId) {
                        console.error('Tin nhắn không có messageId:', newMessage);
                        return;
                    }

                    // Gọi hàm không debounce để lấy chatSessions ngay lập tức
                    const updatedSessions = await fetchChatSessionsImmediate();
                    console.log('Updated chatSessions:', JSON.stringify(updatedSessions, null, 2));

                    if (updatedSessions.length === 0) {
                        console.error('Không thể lấy chatSessions sau khi gọi fetchChatSessionsImmediate');
                        return;
                    }

                    // Tìm session tương ứng
                    const matchingSession = updatedSessions.find(s => String(s.sessionId) === String(newMessage.chatSession.sessionId));
                    if (matchingSession) {
                        // Nếu session chưa được chọn hoặc session khớp
                        if (!selectedSession || String(newMessage.chatSession.sessionId) === String(selectedSession?.sessionId)) {
                            console.log('Thêm tin nhắn vào state messages và chọn session:', newMessage);
                            setMessages((prev) => {
                                console.log('Messages trước khi thêm:', JSON.stringify(prev, null, 2));
                                // Tránh thêm trùng tin nhắn
                                if (prev.some(msg => msg.messageId === newMessage.messageId)) {
                                    console.log('Tin nhắn đã tồn tại trong messages:', newMessage.messageId);
                                    return prev;
                                }
                                const updatedMessages = [...prev, newMessage];
                                console.log('Updated messages:', JSON.stringify(updatedMessages, null, 2));
                                console.log('Số lượng tin nhắn sau khi thêm:', updatedMessages.length);
                                return updatedMessages;
                            });
                            if (!selectedSession) {
                                console.log('Tự động chọn session:', JSON.stringify(matchingSession, null, 2));
                                setSelectedSession(matchingSession);
                            }
                            // Đánh dấu tin nhắn đã đọc nếu cần
                            if (matchingSession.unreadCount > 0 && newMessage.sender.id !== currentUser?.id) {
                                console.log('Đánh dấu tin nhắn đã đọc:', newMessage.messageId);
                                markAsReadDebounced(matchingSession.sessionId, currentUser.id, newMessage.messageId);
                            }
                        } else {
                            console.log('Tin nhắn thuộc session khác, chỉ cập nhật chatSessions. sessionId nhận được:', newMessage.chatSession.sessionId, 'sessionId hiện tại:', selectedSession?.sessionId);
                            fetchChatSessions(); // Cập nhật danh sách session
                        }
                    } else {
                        console.warn('Không tìm thấy session cho sessionId:', newMessage.chatSession.sessionId);
                        fetchChatSessions(); // Thử cập nhật lại
                    }
                } catch (error) {
                    console.error('Lỗi khi parse tin nhắn WebSocket:', error);
                }
            });
            console.log('Đã subscribe vào queue:', `/user/${currentUser.id}/queue/messages`, subscription);

            stompClientRef.current.subscribe(`/user/${currentUser.id}/queue/messages/read`, (message) => {
                console.log('Nhận thông báo đã đọc:', message.body);
                try {
                    const messageId = JSON.parse(message.body);
                    setMessages((prev) => prev.map((msg) => msg.messageId === messageId ? {
                        ...msg,
                        isRead: true
                    } : msg));
                } catch (error) {
                    console.error('Lỗi khi parse thông báo đã đọc:', error);
                }
            });
            reconnectAttempts.current = 0;
        }, (error) => {
            console.error('Lỗi kết nối WebSocket:', error);
            if (reconnectAttempts.current < maxReconnectAttempts) {
                reconnectAttempts.current += 1;
                console.log(`Thử kết nối lại WebSocket... Lần ${reconnectAttempts.current}`);
                setTimeout(connectWebSocket, 5000);
            } else {
                console.error('Đã vượt quá số lần thử kết nối lại');
            }
        });
    };

    // Hàm không debounce để gọi trực tiếp trong connectWebSocket
    const fetchChatSessionsImmediate = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/messages/sessions', {
                withCredentials: true
            });
            console.log('Danh sách session (immediate):', JSON.stringify(response.data, null, 2));
            setChatSessions(response.data);
            setLoading(false);
            if (selectedSession) {
                const updatedSession = response.data.find(s => String(s.sessionId) === String(selectedSession.sessionId));
                if (updatedSession) {
                    console.log('Cập nhật selectedSession:', JSON.stringify(updatedSession, null, 2));
                    setSelectedSession(updatedSession);
                    await fetchMessages(updatedSession.sessionId);
                } else {
                    console.warn('Không tìm thấy updatedSession cho sessionId:', selectedSession.sessionId);
                }
            }
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tải danh sách session (immediate):', error);
            setLoading(false);
            return [];
        }
    };

    const fetchChatSessions = debounce(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/messages/sessions', {
                withCredentials: true
            });
            console.log('Danh sách session:', JSON.stringify(response.data, null, 2));
            setChatSessions(response.data);
            setLoading(false);
            if (selectedSession) {
                const updatedSession = response.data.find(s => String(s.sessionId) === String(selectedSession.sessionId));
                if (updatedSession) {
                    console.log('Cập nhật selectedSession:', JSON.stringify(updatedSession, null, 2));
                    setSelectedSession(updatedSession);
                    await fetchMessages(updatedSession.sessionId);
                } else {
                    console.warn('Không tìm thấy updatedSession cho sessionId:', selectedSession.sessionId);
                }
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách session:', error);
            setLoading(false);
        }
    }, 500);

    const fetchMessages = async (sessionId) => {
        try {
            console.log('Gọi fetchMessages cho sessionId:', sessionId);
            const response = await axios.get(`http://localhost:8080/api/messages/sessions/${sessionId}`, {
                withCredentials: true
            });
            console.log('Danh sách tin nhắn:', JSON.stringify(response.data, null, 2));
            setMessages(response.data);
        } catch (error) {
            console.error('Lỗi khi tải tin nhắn:', error);
        }
    };

    const markAsReadDebounced = debounce(async (sessionId, userId, lastReadMessageId) => {
        try {
            await axios.post(`http://localhost:8080/api/messages/sessions/${sessionId}/read`, null, {
                params: {userId, lastReadMessageId}, withCredentials: true
            });
            setChatSessions((prev) => prev.map((s) => s.sessionId === sessionId ? {...s, unreadCount: 0} : s));
        } catch (error) {
            console.error('Lỗi khi đánh dấu đã đọc:', error);
        }
    }, 1000);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !selectedSession || !stompClientRef.current?.connected) {
            console.warn('Không thể gửi tin nhắn: Thiếu nội dung, session hoặc kết nối WebSocket');
            return;
        }

        let fileUrl = null;
        let fileType = null;
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            try {
                const uploadRes = await axios.post('http://localhost:8080/api/messages/upload', formData, {
                    headers: {'Content-Type': 'multipart/form-data'}, withCredentials: true
                });
                fileUrl = uploadRes.data;
                fileType = selectedFile.type;
            } catch (error) {
                console.error('Lỗi khi upload file:', error);
                return;
            }
        }

        const messageData = {
            chatSession: {sessionId: selectedSession.sessionId},
            sender: {id: currentUser.id},
            receiver: {
                id: selectedSession.user1.id === currentUser.id ? selectedSession.user2.id : selectedSession.user1.id
            },
            content: newMessage || '',
            messageType: selectedFile ? 'FILE' : 'TEXT',
            fileUrl,
            fileType,
            createdAt: new Date().toISOString()
        };

        console.log('Gửi tin nhắn qua WebSocket:', JSON.stringify(messageData, null, 2));
        stompClientRef.current.send('/app/sendMessage', {}, JSON.stringify(messageData));
        setNewMessage('');
        setSelectedFile(null);
        fetchChatSessions();
    };

    const getOtherUser = (session) => {
        return session.user1.id === currentUser?.id ? session.user2 : session.user1;
    };

    const getAvatarUrl = (user) => {
        if (user.avatarUrl && user.avatarUrl !== 'none') {
            return `http://localhost:8080/api/hocho/profile/${user.avatarUrl}`;
        }
        return `/default.png`;
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleChatCreated = (newChatSession) => {
        setChatSessions([...chatSessions, newChatSession]);
        setSelectedSession(newChatSession);
    };

    const sortedSessions = [...chatSessions].sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
    });

    const handleSelectSession = async (session) => {
        setSelectedSession(session);
        if (session.unreadCount > 0 && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            markAsReadDebounced(session.sessionId, currentUser.id, lastMessage.messageId);
        }
    };

    if (loading) {
        return (<div>
            <Header/>
            <div className={styles.loading}>{t('chat_loading')}</div>
            <Footer/>
        </div>);
    }

    return (<div>
        <Header/>
        <div className={styles.messagingContainer}>
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>{t('chat_sidebar_title')}</h2>
                    <button
                        className={styles.newChatButton}
                        onClick={() => {
                            console.log('Clicked new chat button');
                            setShowCreateModal(true);
                        }}
                    >
                        <FontAwesomeIcon icon={faComment}/>
                    </button>
                </div>
                <div className={styles.chatList}>
                    {sortedSessions.length === 0 ? (<div className={styles.noChats}>
                        {t('chat_no_sessions')}
                    </div>) : (sortedSessions.map((session) => {
                        const otherUser = getOtherUser(session);
                        const isUnread = session.unreadCount > 0 && session.lastMessageSenderId !== currentUser?.id;
                        return (<div
                            key={session.sessionId}
                            className={`${styles.chatItem} ${selectedSession?.sessionId === session.sessionId ? styles.active : ''} ${isUnread ? styles.unread : ''}`}
                            onClick={() => handleSelectSession(session)}
                        >
                            <img
                                src={getAvatarUrl(otherUser)}
                                alt={t('chat_avatar_alt')}
                                className={styles.chatAvatar}
                                onError={(e) => {
                                    e.target.src = 'http://localhost:8080/api/hocho/profile/default.png';
                                }}
                            />
                            <div className={styles.chatInfo}>
                                <div className={styles.chatUserName}>
                                    {otherUser.fullName || otherUser.username}
                                    {isUnread && <span className={styles.unreadDot}></span>}
                                </div>
                                <div className={styles.lastMessage}>
                                    {session.lastMessageContent ? session.lastMessageContent : session.lastMessageSenderId && session.lastMessageFileType ? (session.lastMessageFileType.startsWith('image/') ? t('chat_last_message_image') : t('chat_last_message_file')) : t('chat_no_message')}
                                </div>
                            </div>
                        </div>);
                    }))}
                </div>
            </div>

            <div className={styles.chatArea}>
                {selectedSession ? (<>
                    <div className={styles.chatHeader}>
                        <h3>
                            {getOtherUser(selectedSession).fullName || getOtherUser(selectedSession).username}
                        </h3>
                    </div>
                    <div className={styles.messagesContainer} ref={messagesContainerRef} key={messages.length}>
                        {messages.length === 0 ? (<div className={styles.noMessages}>
                            {t('chat_no_message_start')}
                        </div>) : (messages.map((message) => (<div
                            key={message.messageId}
                            className={`${styles.message} ${message.sender.id === currentUser?.id ? styles.sent : styles.received}`}
                        >
                            <div className={styles.messageContent}>
                                {message.fileUrl ? (message.fileType && message.fileType.startsWith('image/') ? (
                                    <div className={styles.mediaWrapper}>
                                        <img
                                            src={`http://localhost:8080/api/messages/image/${message.fileUrl.split('/').pop()}`}
                                            alt={t('chat_image_alt')}
                                            className={styles.chatImage}
                                            onClick={() => setSelectedImage(`http://localhost:8080/api/messages/image/${message.fileUrl.split('/').pop()}`)}
                                        />
                                    </div>) : message.fileType && message.fileType.startsWith('video/') ? (
                                    <div className={styles.mediaWrapper}>
                                        <video
                                            src={`http://localhost:8080/api/messages/image/${message.fileUrl.split('/').pop()}`}
                                            controls
                                            className={styles.chatVideo}
                                        />
                                    </div>) : (<div className={styles.fileWrapper}>
                                    <span className={styles.fileIcon}>📎</span>
                                    <a
                                        href={`http://localhost:8080/api/messages/file/${message.fileUrl.split('/').pop()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.fileName}
                                    >
                                        {message.fileUrl.split('/').pop()}
                                    </a>
                                </div>)) : null}
                                {message.content && <span>{message.content}</span>}
                                {message.isRead && message.sender.id !== currentUser?.id && (<span
                                    className={styles.readIndicator}>{t('chat_read_indicator')}</span>)}
                            </div>
                            <div className={styles.messageTime}>
                                {formatTime(message.createdAt)}
                            </div>
                        </div>)))}
                    </div>

                    <form className={styles.messageForm} onSubmit={sendMessage}>
                        <div className={styles.fileInputWrapper}>
                            <label htmlFor="file-upload" className={styles.fileInputLabel}
                                   title={t('chat_attach_file_hint')}>
                                <FontAwesomeIcon icon={faPaperclip}/>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                className={styles.fileInput}
                                onChange={handleFileChange}
                            />
                            {selectedFile && (
                                <span className={styles.selectedFileName}>{selectedFile.name}</span>)}
                        </div>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('chat_input_placeholder')}
                            className={styles.messageInput}
                        />
                        <button type="submit" className={styles.sendButton}>
                            {t('chat_send')}
                        </button>
                    </form>
                </>) : (<div className={styles.noSelection}>
                    {t('chat_select_session_hint')}
                </div>)}
            </div>
        </div>

        <CreateChatModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onChatCreated={handleChatCreated}
            chatSessions={chatSessions}
            currentUser={currentUser}
            preselectedTeacher={preselectedTeacher}
        />

        <Footer/>

        {selectedImage && (<div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
            onClick={() => setSelectedImage(null)}
        >
            <img
                src={selectedImage}
                alt={t('chat_image_alt_large')}
                style={{maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 2px 16px #000'}}
                onClick={(e) => e.stopPropagation()}
            />
        </div>)}
    </div>);
};

export default MessagingPage;
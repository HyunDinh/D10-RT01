import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/Messaging.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CreateChatModal from './CreateChatModal';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

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

    useEffect(() => {
        fetchCurrentUser();
        fetchChatSessions();
    }, []);

    useEffect(() => {
        if (selectedSession) {
            fetchMessages(selectedSession.sessionId);
        }
    }, [selectedSession]);

    // Gọi markAsRead khi load messages xong
    useEffect(() => {
        if (selectedSession && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage) {
                axios.post(`http://localhost:8080/api/messages/sessions/${selectedSession.sessionId}/read`, null, {
                    params: {
                        userId: currentUser.id,
                        lastReadMessageId: lastMessage.messageId
                    },
                    withCredentials: true
                }).then(() => {
                    fetchChatSessions();
                }).catch((error) => {
                    console.error('Error marking as read:', error);
                });
            }
        }
    }, [selectedSession, messages]);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/hocho/profile', {
                withCredentials: true
            });
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchChatSessions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/messages/sessions', {
                withCredentials: true
            });
            setChatSessions(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching chat sessions:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (sessionId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/messages/sessions/${sessionId}`, {
                withCredentials: true
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !selectedSession) return;

        let fileUrl = null;
        let fileType = null;
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const uploadRes = await axios.post('http://localhost:8080/api/messages/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            fileUrl = uploadRes.data;
            fileType = selectedFile.type;
        }

        try {
            const messageData = {
                chatSession: { sessionId: selectedSession.sessionId },
                sender: { id: currentUser.id },
                receiver: {
                    id: selectedSession.user1.id === currentUser.id
                        ? selectedSession.user2.id
                        : selectedSession.user1.id
                },
                content: newMessage,
                messageType: selectedFile ? 'FILE' : 'TEXT',
                fileUrl,
                fileType
            };

            const response = await axios.post('http://localhost:8080/api/messages/send', messageData, {
                withCredentials: true
            });

            setMessages([...messages, response.data]);
            setNewMessage('');
            setSelectedFile(null);

            // Cập nhật luôn lastMessageSenderId và unreadCount cho session hiện tại
            setChatSessions(prev =>
                prev.map(s =>
                    s.sessionId === selectedSession.sessionId
                        ? { ...s, lastMessageSenderId: currentUser.id, unreadCount: 0 }
                        : s
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const getOtherUser = (session) => {
        return session.user1.id === currentUser?.id ? session.user2 : session.user1;
    };

    const getAvatarUrl = (user) => {
        if (user.avatarUrl && user.avatarUrl !== 'none') {
            return `http://localhost:8080/api/hocho/profile/${user.avatarUrl}`;
        }
        return `http://localhost:8080/api/hocho/profile/default.png`;
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleChatCreated = (newChatSession) => {
        setChatSessions([...chatSessions, newChatSession]);
        setSelectedSession(newChatSession);
    };

    // Sắp xếp các session theo thời gian tin nhắn gần nhất (mới nhất lên đầu)
    const sortedSessions = [...chatSessions].sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
    });

    // Đánh dấu đã đọc khi chọn session
    const handleSelectSession = async (session) => {
        setSelectedSession(session);
        // Nếu có tin nhắn chưa đọc thì gọi API markAsRead
        if (session.unreadCount > 0 && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            try {
                await axios.post(`http://localhost:8080/api/messages/sessions/${session.sessionId}/read`, null, {
                    params: {
                        userId: currentUser.id,
                        lastReadMessageId: lastMessage.messageId
                    },
                    withCredentials: true
                });
                // Cập nhật luôn unreadCount về 0 cho session vừa chọn
                setChatSessions(prev =>
                    prev.map(s =>
                        s.sessionId === session.sessionId
                            ? { ...s, unreadCount: 0 }
                            : s
                    )
                );
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
    };

    if (loading) {
        return (
            <div>
                <Header />
                <div className={styles.loading}>Đang tải...</div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className={styles.messagingContainer}>
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h2>Tin nhắn</h2>
                        <button 
                            className={styles.newChatButton}
                            onClick={() => setShowCreateModal(true)}
                        >
                            +
                        </button>
                    </div>
                    <div className={styles.chatList}>
                        {sortedSessions.length === 0 ? (
                            <div className={styles.noChats}>
                                Chưa có cuộc trò chuyện nào
                            </div>
                        ) : (
                            sortedSessions.map((session) => {
                                const otherUser = getOtherUser(session);
                                const isUnread = session.unreadCount > 0 && session.lastMessageSenderId !== currentUser?.id;
                                return (
                                    <div
                                        key={session.sessionId}
                                        className={`${styles.chatItem} ${
                                            selectedSession?.sessionId === session.sessionId ? styles.active : ''
                                        } ${isUnread ? styles.unread : ''}`}
                                        onClick={() => handleSelectSession(session)}
                                    >
                                        <img
                                            src={getAvatarUrl(otherUser)}
                                            alt="Avatar"
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
                                                {session.lastMessageContent
                                                    ? session.lastMessageContent
                                                    : session.lastMessageSenderId && session.lastMessageFileType
                                                        ? (session.lastMessageFileType.startsWith('image/')
                                                            ? 'Đã gửi một hình ảnh'
                                                            : 'Đã gửi một tệp tin')
                                                        : 'Chưa có tin nhắn'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className={styles.chatArea}>
                    {selectedSession ? (
                        <>
                            <div className={styles.chatHeader}>
                                <h3>
                                    {getOtherUser(selectedSession).fullName || 
                                     getOtherUser(selectedSession).username}
                                </h3>
                            </div>

                            <div className={styles.messagesContainer}>
                                {messages.length === 0 ? (
                                    <div className={styles.noMessages}>
                                        Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.messageId}
                                            className={`${styles.message} ${
                                                message.sender.id === currentUser?.id 
                                                    ? styles.sent 
                                                    : styles.received
                                            }`}
                                        >
                                            <div className={styles.messageContent}>
                                                {message.fileUrl ? (
                                                    message.fileType && message.fileType.startsWith('image/') ? (
                                                        <div className={styles.mediaWrapper}>
                                                            <img
                                                                src={`http://localhost:8080/api/messages/image/${message.fileUrl.split('/').pop()}`}
                                                                alt="img"
                                                                className={styles.chatImage}
                                                                onClick={() => setSelectedImage(`http://localhost:8080/api/messages/image/${message.fileUrl.split('/').pop()}`)}
                                                            />
                                                        </div>
                                                    ) : message.fileType && message.fileType.startsWith('video/') ? (
                                                        <div className={styles.mediaWrapper}>
                                                            <video
                                                                src={`http://localhost:8080/api/messages/image/${message.fileUrl.split('/').pop()}`}
                                                                controls
                                                                className={styles.chatVideo}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className={styles.fileWrapper}>
                                                            <span className={styles.fileIcon}>📎</span>
                                                            <a href={`http://localhost:8080/api/messages/file/${message.fileUrl.split('/').pop()}`}
                                                                target="_blank" rel="noopener noreferrer" className={styles.fileName}>
                                                                {message.fileUrl.split('/').pop()}
                                                            </a>
                                                        </div>
                                                    )
                                                ) : null}
                                                {message.content && <span>{message.content}</span>}
                                            </div>
                                            <div className={styles.messageTime}>
                                                {formatTime(message.createdAt)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form className={styles.messageForm} onSubmit={sendMessage}>
                                <div className={styles.fileInputWrapper}>
                                    <label htmlFor="file-upload" className={styles.fileInputLabel} title="Đính kèm file hoặc hình ảnh">
                                        <FontAwesomeIcon icon={faPaperclip} />
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className={styles.fileInput}
                                        onChange={handleFileChange}
                                    />
                                    {selectedFile && (
                                        <span className={styles.selectedFileName}>{selectedFile.name}</span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className={styles.messageInput}
                                />
                                <button type="submit" className={styles.sendButton}>
                                    Gửi
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className={styles.noSelection}>
                            Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                        </div>
                    )}
                </div>
            </div>

            <CreateChatModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onChatCreated={handleChatCreated}
                chatSessions={chatSessions}
                currentUser={currentUser}
            />
            
            <Footer />

            {selectedImage && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="img-large"
                        style={{maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 2px 16px #000'}}
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default MessagingPage; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { Document, Page, pdfjs } from 'react-pdf'
import { Spin, message } from 'antd';

// Cấu hình worker cho react-pdf để sử dụng file cục bộ (với đuôi .mjs)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function LessonContentPlayer() {
    const { contentId } = useParams();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [fileBuffer, setFileBuffer] = useState(null); // Thay đổi state thành ArrayBuffer
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAndProcessContent = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/lesson-contents/content/${contentId}`);
                const fetchedContent = response.data;
                setContent(fetchedContent);

                console.log('Dữ liệu nội dung được tìm nạp:', fetchedContent);

                if (fetchedContent && fetchedContent.contentData) {
                    const arrayBuffer = base64ToArrayBuffer(fetchedContent.contentData);
                    let blobType = '';
                    if (fetchedContent.contentType === 'VIDEO') {
                        blobType = 'video/mp4'; // Hoặc loại video chính xác hơn nếu có
                    } else if (fetchedContent.contentType === 'PDF') {
                        blobType = 'application/pdf';
                    }
                    const newBlob = new Blob([arrayBuffer], { type: blobType });
                    const url = URL.createObjectURL(newBlob);
                    setFileBuffer(arrayBuffer); // Lưu ArrayBuffer trực tiếp
                } else {
                    message.error('Không thể tải nội dung: dữ liệu bị thiếu hoặc không hợp lệ.');
                    setFileBuffer(null);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching content:', error);
                message.error('Failed to load content');
                setLoading(false);
                setFileBuffer(null);
            }
        };

        fetchAndProcessContent();

        // Cleanup function (không cần revoke URL nữa)
        return () => {
            // Không cần làm gì cho ArrayBuffer
        };
    }, [contentId]); // Dependency array chỉ bao gồm contentId

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        console.log('Số trang PDF được tải:', numPages);
    };

    // Hàm chuyển đổi base64 sang ArrayBuffer
    const base64ToArrayBuffer = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    if (loading) {
        return <Spin size="large" />;
    }

    if (!content) {
        return <div>Content not found</div>;
    }

    const renderContent = () => {
        switch (content.contentType) {
            case 'VIDEO':
                return (
                    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                        {fileBuffer ? (
                            <ReactPlayer
                                url={URL.createObjectURL(new Blob([fileBuffer], { type: 'video/mp4' }))} // Tạo Blob URL tạm thời cho video
                                controls
                                width="100%"
                                height="auto"
                            />
                        ) : (
                            <div>Loading video...</div>
                        )}
                    </div>
                );
            case 'PDF':
                return (
                    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                        {fileBuffer ? (
                            <Document
                                key={contentId}
                                file={fileBuffer} // Truyền trực tiếp ArrayBuffer
                                onLoadSuccess={onDocumentLoadSuccess}
                                onError={(error) => {
                                    console.error('Lỗi khi tải tài liệu PDF:', error);
                                    message.error('Không thể tải tài liệu PDF.');
                                }}
                            >
                                <Page pageNumber={pageNumber} />
                            </Document>
                        ) : (
                            <div>Loading PDF...</div>
                        )}
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <button
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(pageNumber - 1)}
                            >
                                Previous
                            </button>
                            <span>
                                Page {pageNumber} of {numPages}
                            </span>
                            <button
                                disabled={pageNumber >= numPages}
                                onClick={() => setPageNumber(pageNumber + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div>Unsupported content type</div>;
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <h2>{content.title}</h2>
            {renderContent()}
        </div>
    );
} 
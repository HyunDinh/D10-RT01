import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Modal, Select, Spin, message, Typography, Form, Row, Col, Card, Input } from 'antd';
import axios from 'axios';
import {Link} from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

// Helper to format seconds to hh:mm:ss
function formatSecondsToHMS(seconds) {
    seconds = Number(seconds) || 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
        .map(unit => unit.toString().padStart(2, '0'))
        .join(':');
}

// Helper to parse hh:mm:ss, mm:ss, or ss to seconds
function parseHMSToSeconds(str) {
    if (!str) return 0;
    const parts = str.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        return parts[0];
    }
    return 0;
}

export default function TimeRestrictionPage() {
    const [loading, setLoading] = useState(true);
    const [restrictions, setRestrictions] = useState([]);
    const [editing, setEditing] = useState({});
    const [visible, setVisible] = useState(false);
    const [newRestriction, setNewRestriction] = useState({
        childId: null,
        maxPlayTimeHours: 0,
        maxPlayTimeMinutes: 0,
        maxPlayTimeSeconds: 0,
        maxVideoTimeHours: 0,
        maxVideoTimeMinutes: 0,
        maxVideoTimeSeconds: 0
    });
    const [form] = Form.useForm();
    const [deleteModal, setDeleteModal] = useState({ visible: false, childId: null });

    // Calculate total seconds from hours, minutes, and seconds
    const calculateTotalSeconds = (hours, minutes, seconds) => {
        return (
            (parseInt(hours) || 0) * 3600 +
            (parseInt(minutes) || 0) * 60 +
            (parseInt(seconds) || 0)
        );
    };

    // Fetch all restrictions for the logged-in parent
    const fetchRestrictions = async () => {
        try {
            setLoading(true);
            // Fetch restrictions and children simultaneously
            const [restrictionsResponse, childrenResponse] = await Promise.all([
                axios.get('/api/time-restriction/get', { withCredentials: true }),
                axios.get('/api/parent-child', { withCredentials: true })
            ]);

            // Create a map from child id to full name
            const childrenMap = new Map();
            childrenResponse.data.forEach(child => {
                childrenMap.set(child.childId, child.fullName);
            });

            // Map childId to restriction for quick lookup
            const restrictionMap = new Map();
            restrictionsResponse.data.forEach(restriction => {
                restrictionMap.set(restriction.childId, restriction);
            });

            // Gộp: Tạo danh sách tất cả các con, nếu có restriction thì lấy, không thì tạo bản ghi mới
            const allRows = childrenResponse.data.map(child => {
                // Lấy đúng trường id từ backend (id hoặc user_id)
                const realChildId = child.childId || child.id || child.user_id;
                const restriction = restrictionMap.get(realChildId);
                return restriction
                    ? { ...restriction, childFullName: child.fullName, childId: realChildId }
                    : {
                        childId: realChildId,
                        childFullName: child.fullName,
                        maxVideoTime: 0,
                        // Có thể thêm các trường khác nếu cần
                    };
            });

            setRestrictions(allRows);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching restrictions:', err);
            message.error('Failed to load time restrictions.');
            setLoading(false);
        }
    };

    // Save restrictions for a specific child
    const saveRestrictions = async (childId) => {
        const restriction = editing[childId];
        if (!restriction) return;
        try {
            const maxVideoTime = parseHMSToSeconds(restriction.maxVideoTimeHMS);
            const params = new URLSearchParams();
            params.append('childId', childId);
            params.append('maxVideoTime', maxVideoTime);
            await axios.post('/api/time-restriction/set', params, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            message.success('Restriction saved successfully!');
            setEditing((prev) => ({ ...prev, [childId]: null }));
            fetchRestrictions();
        } catch (err) {
            console.error('Error saving restrictions:', err);
            message.error('Failed to save restrictions.');
        }
    };

    // Handle input changes for the editing fields
    const onInputChange = (childId, field, value) => {
        setEditing((prev) => ({
            ...prev,
            [childId]: {
                ...prev[childId],
                [field]: value,
            },
        }));
    };

    useEffect(() => {
        fetchRestrictions();
    }, []);

    // Reset restriction handler
    const handleReset = async (childId) => {
        try {
            await axios.post(`/api/time-restriction/reset?childId=${childId}`, {}, { withCredentials: true });
            message.success("Restriction reset successfully!");
            setDeleteModal({ visible: false, childId: null });
            fetchRestrictions();
        } catch (err) {
            message.error("Failed to reset restriction.");
            setDeleteModal({ visible: false, childId: null });
        }
    };

    // Table columns definition
    const columns = [
        {
            title: 'Child Name',
            dataIndex: 'childFullName',
            key: 'childFullName',
        },
        {
            title: 'Max Video Time',
            dataIndex: 'videoTimeFormatted',
            key: 'maxVideoTime',
            render: (text, record) => {
                const realChildId = record.childId;
                // Determine value to show in input
                let value = editing[realChildId]?.maxVideoTimeHMS;
                if (value === undefined) {
                    value = formatSecondsToHMS(record.maxVideoTime);
                }
                return (
                    <Input
                        value={value}
                        placeholder="hh:mm:ss"
                        onChange={e => {
                            const val = e.target.value;
                            setEditing(prev => ({
                                ...prev,
                                [realChildId]: {
                                    ...prev[realChildId],
                                    maxVideoTimeHMS: val
                                }
                            }));
                        }}
                        style={{ width: 120 }}
                    />
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => {
                const realChildId = record.childId;
                // Log để debug
                // eslint-disable-next-line
                console.log('Render Actions for childId:', realChildId);
                return (
                    <>
                        <Button
                            type="primary"
                            onClick={() => {
                                // Log để debug
                                // eslint-disable-next-line
                                console.log('Save restriction for childId:', realChildId);
                                saveRestrictions(realChildId);
                            }}
                            disabled={!editing[realChildId]}
                            style={{ marginRight: 8 }}
                        >
                            Save
                        </Button>
                        <Button
                            danger
                            onClick={() => {
                                // Log để debug
                                // eslint-disable-next-line
                                console.log('Reset restriction for childId:', realChildId);
                                setDeleteModal({ visible: true, childId: realChildId });
                            }}
                        >
                            Reset
                        </Button>
                    </>
                );
            },
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Manage Time Restrictions</Title>

            <Card title="About Time Restrictions" style={{ marginBottom: 16 }}>
                <p>Time restrictions limit how long your child can play games or watch videos.</p>
                <p>After the time limit is reached, your child will be blocked from accessing that content.</p>
            </Card>

            {loading ? (
                <Spin />
            ) : (
                <>
                    <Table
                        dataSource={restrictions.map((r) => ({ ...r, key: r.childId || (r.child && r.child.id) }))}
                        columns={columns}
                        pagination={false}
                    />
                    <Modal
                        title="Confirm Reset"
                        open={deleteModal.visible}
                        onOk={() => handleReset(deleteModal.childId)}
                        onCancel={() => setDeleteModal({ visible: false, childId: null })}
                        okText="Reset"
                        okButtonProps={{ danger: true }}
                    >
                        Are you sure you want to reset this time restriction?
                    </Modal>
                </>
            )}
        </div>
    );
}
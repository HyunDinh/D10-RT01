import React, {useEffect, useState} from 'react';
import {Button, Card, Input, message, Modal, Spin, Table,} from 'antd';
import axios from 'axios';
import styles from "../../styles/TimeRestriction.module.css";
import { useTranslation } from 'react-i18next';

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

export default function TimeRestrictionPage({ childId }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [restrictions, setRestrictions] = useState([]);
    const [editing, setEditing] = useState({});
    const [deleteModal, setDeleteModal] = useState({visible: false, childId: null});

    // Fetch all restrictions for the logged-in parent
    const fetchRestrictions = async () => {
        try {
            setLoading(true);
            // Fetch restrictions and children simultaneously
            const [restrictionsResponse, childrenResponse] = await Promise.all([
                axios.get('/api/time-restriction/get', {withCredentials: true}),
                axios.get('/api/parent-child', {withCredentials: true})
            ]);

            // Create a map from child id to full name
            const childrenMap = new Map();
            childrenResponse.data.forEach(child => {
                childrenMap.set(child.childId, child.fullName);
            });

            // Map childId to restriction for quick lookup (dùng key là restriction.child.id)
            const restrictionMap = new Map();
            restrictionsResponse.data.forEach(restriction => {
                restrictionMap.set(String(restriction.child.id), restriction);
            });

            // Gộp: Tạo danh sách tất cả các con, nếu có restriction thì lấy, không thì tạo bản ghi mới
            const allRows = childrenResponse.data.map(child => {
                const realChildId = child.childId || child.id || child.user_id;
                const restriction = restrictionMap.get(String(realChildId));
                const maxVideoTime = restriction?.maxVideoTime ?? 0;
                return restriction
                    ? {...restriction, childFullName: child.fullName, childId: realChildId, maxVideoTime}
                    : {
                        childId: realChildId,
                        childFullName: child.fullName,
                        maxVideoTime: 0,
                    };
            });

            setRestrictions(allRows);
            // Log dữ liệu sau khi map để debug (chi tiết từng trường)
            // eslint-disable-next-line
            console.log('All rows after map:', JSON.stringify(allRows, null, 2));
            setLoading(false);
        } catch (err) {
            console.error('Error fetching restrictions:', err);
            message.error(t('time_restriction_error_load'));
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
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            message.success(t('time_restriction_save_success'));
            setEditing((prev) => ({...prev, [childId]: null}));
            fetchRestrictions();
        } catch (err) {
            console.error('Error saving restrictions:', err);
            message.error(t('time_restriction_save_error'));
        }
    };

    useEffect(() => {
        fetchRestrictions();
    }, [childId]);

    // Reset restriction handler
    const handleReset = async (childId) => {
        try {
            await axios.post(`/api/time-restriction/reset?childId=${childId}`, {}, {withCredentials: true});
            message.success(t('time_restriction_reset_success'));
            setDeleteModal({visible: false, childId: null});
            fetchRestrictions();
        } catch (err) {
            message.error(t('time_restriction_reset_error'));
            setDeleteModal({visible: false, childId: null});
        }
    };

    // Table columns definition
    const columns = [
        {
            title: t('time_restriction_child_name'),
            dataIndex: 'childFullName',
            key: 'childFullName',
        },
        {
            title: t('time_restriction_max_video_time'),
            dataIndex: 'videoTimeFormatted',
            key: 'maxVideoTime',
            render: (text, record) => {
                // Log chi tiết giá trị thực tế
                // eslint-disable-next-line
                console.log('Record in render:', {
                    childId: record.childId,
                    childFullName: record.childFullName,
                    maxVideoTime: record.maxVideoTime,
                    max_video_time: record.max_video_time
                });
                const realChildId = record.childId;
                let value = editing[realChildId]?.maxVideoTimeHMS;
                if (value === undefined) {
                    value = formatSecondsToHMS(record.maxVideoTime);
                }
                return (
                    <Input
                        value={value}
                        placeholder={t('time_restriction_input_placeholder')}
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
                        style={{width: 120}}
                    />
                );
            }
        },
        {
            title: t('time_restriction_actions'),
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
                            style={{marginRight: 8}}
                        >
                            {t('time_restriction_save')}
                        </Button>
                        <Button
                            danger
                            onClick={() => {
                                // Log để debug
                                // eslint-disable-next-line
                                console.log('Reset restriction for childId:', realChildId);
                                setDeleteModal({visible: true, childId: realChildId});
                            }}
                        >
                            {t('time_restriction_reset')}
                        </Button>
                    </>
                );
            },
        },
    ];

    // Filter to only the selected child if childId is provided
    const filteredRestrictions = childId
        ? restrictions.filter(r => String(r.childId) === String(childId))
        : restrictions;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{t('time_restriction_title')}</h1>
            </div>
            <Card title={t('time_restriction_about_title')} style={{marginBottom: 16}}>
                <p>{t('time_restriction_about_1')}</p>
                <p>{t('time_restriction_about_2')}</p>
            </Card>
            {loading ? (
                <Spin/>
            ) : filteredRestrictions.length === 0 ? (
                <div>{t('time_restriction_empty')}</div>
            ) : (
                <Table
                    dataSource={filteredRestrictions}
                    columns={columns}
                    rowKey="childId"
                    pagination={false}
                />
            )}
            <Modal
                title={t('time_restriction_confirm_reset_title')}
                open={deleteModal.visible}
                onOk={() => handleReset(deleteModal.childId)}
                onCancel={() => setDeleteModal({visible: false, childId: null})}
                okText={t('time_restriction_reset')}
                okButtonProps={{danger: true}}
            >
                {t('time_restriction_confirm_reset')}
            </Modal>
        </div>
    );
}
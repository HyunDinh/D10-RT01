import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Trong phần render của component
return (
    <div>
        {/* ... existing code ... */}
        
        <Space style={{ marginTop: '16px' }}>
            <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate(`/lesson-content/add/${lessonId}`)}
            >
                Add Content
            </Button>
            <Button onClick={() => navigate(`/lesson/${lessonId}/contents`)}>
                View Contents
            </Button>
        </Space>
        
        {/* ... existing code ... */}
    </div>
);
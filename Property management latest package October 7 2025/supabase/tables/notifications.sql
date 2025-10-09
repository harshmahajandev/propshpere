CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    notification_type VARCHAR(50),
    title VARCHAR(200),
    message TEXT,
    status VARCHAR(20) DEFAULT 'unread',
    priority VARCHAR(20) DEFAULT 'normal',
    metadata JSONB,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
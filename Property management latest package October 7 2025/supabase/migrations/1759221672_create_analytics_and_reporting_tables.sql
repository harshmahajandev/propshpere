-- Migration: create_analytics_and_reporting_tables
-- Created at: 1759221672

-- Enhanced analytics table for detailed reporting
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS revenue_data JSONB DEFAULT '{}';
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS occupancy_data JSONB DEFAULT '{}';
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS booking_trends JSONB DEFAULT '{}';
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS customer_analytics JSONB DEFAULT '{}';
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS property_performance JSONB DEFAULT '{}';

-- Report templates for PDF generation
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('financial', 'occupancy', 'customer', 'property', 'custom')),
    description TEXT,
    template_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated reports tracking
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
    report_name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    parameters JSONB NOT NULL,
    file_url TEXT,
    file_size BIGINT,
    generated_by UUID REFERENCES profiles(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- System settings for configurations
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL CHECK (setting_type IN ('global', 'user', 'property', 'financial')),
    description TEXT,
    is_editable BOOLEAN DEFAULT TRUE,
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('default_currency', '"BHD"', 'global', 'Default currency for the system'),
('invoice_numbering', '{"prefix": "INV", "start_number": 1000, "format": "INV-{year}-{number}"}', 'financial', 'Invoice numbering configuration'),
('payment_terms', '{"default_days": 30, "late_fee_percentage": 2}', 'financial', 'Default payment terms'),
('occupancy_calculation', '{"method": "daily", "weekend_factor": 1.2}', 'global', 'Occupancy rate calculation method'),
('notification_settings', '{"email_enabled": true, "sms_enabled": false, "push_enabled": true}', 'global', 'System notification settings'),
('maintenance_status_colors', '{"available": "#10B981", "booked": "#EF4444", "maintenance": "#F59E0B", "out_of_service": "#6B7280", "reserved": "#F97316"}', 'global', 'Color coding for unit availability status')
ON CONFLICT (setting_key) DO NOTHING;

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(type);
CREATE INDEX IF NOT EXISTS idx_generated_reports_type ON generated_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_generated_reports_generated_at ON generated_reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_system_settings_type ON system_settings(setting_type);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;
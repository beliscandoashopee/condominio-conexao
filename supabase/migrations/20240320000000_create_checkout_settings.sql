-- Create checkout_settings table
CREATE TABLE IF NOT EXISTS checkout_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pix_enabled BOOLEAN DEFAULT true,
    credit_card_enabled BOOLEAN DEFAULT true,
    manual_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default settings
INSERT INTO checkout_settings (pix_enabled, credit_card_enabled, manual_enabled)
VALUES (true, true, true)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_checkout_settings_updated_at
    BEFORE UPDATE ON checkout_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE checkout_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users"
    ON checkout_settings FOR SELECT
    TO authenticated
    USING (true);

-- Allow update access only to admin users
CREATE POLICY "Allow update access only to admin users"
    ON checkout_settings FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    ); 
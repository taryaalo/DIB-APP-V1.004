-- Connect to the database (replace 'dib_app_data' with your database name if different)
\c dib_app_data;

-- Create tables if they do not exist
CREATE TABLE IF NOT EXISTS personal_info (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    passport_number VARCHAR(50),
    passport_issue_date DATE,
    passport_expiry_date DATE,
    birth_place VARCHAR(100),
    dob DATE,
    gender VARCHAR(10),
    nationality VARCHAR(50),
    family_record_number VARCHAR(50),
    national_id VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    residence_expiry DATE,
    census_card_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_number VARCHAR(100) UNIQUE,
    ai_model VARCHAR(20),
    service_type VARCHAR(50),
    manual_fields TEXT[],
    confirmed_by_admin BOOLEAN DEFAULT FALSE,
    approved_by_admin_name VARCHAR(100),
    approved_by_admin_ip VARCHAR(50)
);

-- Add new columns to personal_info if they do not exist
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS first_name_ar VARCHAR(100);
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS middle_name_ar VARCHAR(100);
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS last_name_ar VARCHAR(100);
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS surname_ar VARCHAR(100);
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS surname_en VARCHAR(100);
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS mother_full_name VARCHAR(255);
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS branch_id INT;
ALTER TABLE personal_info ADD COLUMN IF NOT EXISTS language VARCHAR(5);

CREATE TABLE IF NOT EXISTS address_info (
    id SERIAL PRIMARY KEY,
    personal_id INT,
    national_id VARCHAR(20),
    reference_number VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    city VARCHAR(50),
    area VARCHAR(100),
    residential_address TEXT,
    confirmed_by_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS work_income_info (
    id SERIAL PRIMARY KEY,
    personal_id INT,
    national_id VARCHAR(20),
    reference_number VARCHAR(100) NOT NULL,
    employment_status VARCHAR(50),
    job_title VARCHAR(100),
    employer VARCHAR(100),
    employer_address TEXT,
    employer_phone VARCHAR(20),
    source_of_income VARCHAR(100),
    monthly_income VARCHAR(100),
    confirmed_by_admin BOOLEAN DEFAULT FALSE
);

-- Add new columns to work_income_info if they do not exist
ALTER TABLE work_income_info ADD COLUMN IF NOT EXISTS work_sector VARCHAR(100);
ALTER TABLE work_income_info ADD COLUMN IF NOT EXISTS field_of_work VARCHAR(100);
ALTER TABLE work_income_info ADD COLUMN IF NOT EXISTS work_start_date DATE;

CREATE TABLE IF NOT EXISTS uploaded_documents (
    id SERIAL PRIMARY KEY,
    personal_id INT,
    national_id VARCHAR(20),
    doc_type VARCHAR(50),
    file_name TEXT NOT NULL,
    reference_number VARCHAR(100) NOT NULL,
    confirmed_by_admin BOOLEAN DEFAULT FALSE,
    approved_by_admin_name VARCHAR(100),
    approved_by_admin_ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    activity TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS error_log (
    id SERIAL PRIMARY KEY,
    error TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints if they do not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'address_info_personal_id_fkey') THEN
        ALTER TABLE address_info ADD CONSTRAINT address_info_personal_id_fkey FOREIGN KEY (personal_id) REFERENCES personal_info(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'address_info_reference_number_fkey') THEN
        ALTER TABLE address_info ADD CONSTRAINT address_info_reference_number_fkey FOREIGN KEY (reference_number) REFERENCES personal_info(reference_number);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'address_info_reference_number_key') THEN
        ALTER TABLE address_info ADD CONSTRAINT address_info_reference_number_key UNIQUE (reference_number);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'work_income_info_personal_id_fkey') THEN
        ALTER TABLE work_income_info ADD CONSTRAINT work_income_info_personal_id_fkey FOREIGN KEY (personal_id) REFERENCES personal_info(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'work_income_info_reference_number_fkey') THEN
        ALTER TABLE work_income_info ADD CONSTRAINT work_income_info_reference_number_fkey FOREIGN KEY (reference_number) REFERENCES personal_info(reference_number);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'work_income_info_reference_number_key') THEN
        ALTER TABLE work_income_info ADD CONSTRAINT work_income_info_reference_number_key UNIQUE (reference_number);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uploaded_documents_personal_id_fkey') THEN
        ALTER TABLE uploaded_documents ADD CONSTRAINT uploaded_documents_personal_id_fkey FOREIGN KEY (personal_id) REFERENCES personal_info(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uploaded_documents_reference_number_fkey') THEN
        ALTER TABLE uploaded_documents ADD CONSTRAINT uploaded_documents_reference_number_fkey FOREIGN KEY (reference_number) REFERENCES personal_info(reference_number);
    END IF;
END;
$$;

-- Table for bank branches
CREATE TABLE IF NOT EXISTS bank_branches (
    branch_id INT PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    location TEXT
);

INSERT INTO bank_branches(branch_id, name_en, name_ar, city, location) VALUES
    (101, 'Main Branch', 'الفرع الرئيسي', 'Benghazi', 'Google map location'),
    (102, 'Alzaho Branch', 'فرع الزهو', 'Benghazi', 'Google map location'),
    (103, 'Aljawhra Branch', 'فرع الجوهرة', 'Benghazi', 'Google map location'),
    (104, 'Tripoli Branch', 'فرع طرابلس', 'Tripoli', 'Google map location')
ON CONFLICT (branch_id) DO NOTHING;

-- Queue table for appointments
CREATE TABLE IF NOT EXISTS customer_queue (
    id SERIAL PRIMARY KEY,
    branch VARCHAR(100) NOT NULL,
    reference_number VARCHAR(100) REFERENCES personal_info(reference_number),
    appointment_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch, appointment_time)
);

-- Table for message templates
CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    template_key VARCHAR(50) NOT NULL,
    media VARCHAR(20) NOT NULL,
    english_template TEXT NOT NULL,
    arabic_template TEXT NOT NULL,
    UNIQUE(template_key, media)
);

-- Default templates used by the application
INSERT INTO message_templates (template_key, media, english_template, arabic_template) VALUES
    ('otp', 'sms', 'Your OTP code is {{code}}', 'رمز التحقق الخاص بك هو {{code}}'),
    ('otp', 'email', 'Your OTP code is {{code}}', 'رمز التحقق الخاص بك هو {{code}}'),
    ('appointment', 'sms', 'Dear {{name}},\nYour appointment at {{branch}} branch of Daman Islamic Bank is on {{day_en}} {{date}} at {{time}} to complete opening your account.\nReference: {{reference}}\nFor inquiries: 0919875555\nWe look forward to welcoming you!', 'السلام عليكم أ. {{name}}\nموعدكم في فرع {{branch}} بمصرف الضمان الإسلامي\nيوم {{day_ar}} الموافق {{date}} الساعة {{time}}\nلإكمال فتح حسابكم\nمرجع: {{reference}}\nللاستفسار: 0919875555\nنتطلع لاستقبالكم!'),
    ('appointment', 'email', 'Dear {{name}},\nYour appointment at {{branch}} branch of Daman Islamic Bank is on {{day_en}} {{date}} at {{time}} to complete opening your account.\nReference: {{reference}}\nFor inquiries: 0919875555\nWe look forward to welcoming you!', 'السلام عليكم أ. {{name}}\nموعدكم في فرع {{branch}} بمصرف الضمان الإسلامي\nيوم {{day_ar}} الموافق {{date}} الساعة {{time}}\nلإكمال فتح حسابكم\nمرجع: {{reference}}\nللاستفسار: 0919875555\nنتطلع لاستقبالكم!')
ON CONFLICT (template_key, media) DO NOTHING;

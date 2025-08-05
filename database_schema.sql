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
    work_country VARCHAR(50),
    work_city VARCHAR(50),
    confirmed_by_admin BOOLEAN DEFAULT FALSE
);

-- Add new columns to work_income_info if they do not exist
ALTER TABLE work_income_info ADD COLUMN IF NOT EXISTS work_sector VARCHAR(100);
ALTER TABLE work_income_info ADD COLUMN IF NOT EXISTS field_of_work VARCHAR(100);
ALTER TABLE work_income_info ADD COLUMN IF NOT EXISTS work_start_date DATE;
ALTER TABLE work_income_info ADD COLUMN IF NOT EXISTS work_country VARCHAR(50);
ALTER TABLE work_income_info ADD COLUMN IF NOT EXISTS work_city VARCHAR(50);

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

CREATE TABLE IF NOT EXISTS customer_details (
    id SERIAL PRIMARY KEY,
    personal_info_id INT REFERENCES personal_info(id) ON DELETE CASCADE,
    customer_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
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

-- Table for countries
CREATE TABLE IF NOT EXISTS countries (
    code VARCHAR(5) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL
);

INSERT INTO countries (code, name_en, name_ar) VALUES
    ('AF', 'Afghanistan', 'أفغانستان'),
    ('AL', 'Albania', 'ألبانيا'),
    ('DZ', 'Algeria', 'الجزائر'),
    ('AS', 'American Samoa', 'ساموا الأمريكية'),
    ('AD', 'Andorra', 'أندورا'),
    ('AO', 'Angola', 'أنغولا'),
    ('AI', 'Anguilla', 'أنغويلا'),
    ('AQ', 'Antarctica', 'القارة القطبية الجنوبية'),
    ('AG', 'Antigua and Barbuda', 'أنتيغوا وباربودا'),
    ('AR', 'Argentina', 'الأرجنتين'),
    ('AM', 'Armenia', 'أرمينيا'),
    ('AW', 'Aruba', 'أروبا'),
    ('AU', 'Australia', 'أستراليا'),
    ('AT', 'Austria', 'النمسا'),
    ('AZ', 'Azerbaijan', 'أذربيجان'),
    ('BS', 'Bahamas', 'جزر البهاما'),
    ('BH', 'Bahrain', 'البحرين'),
    ('BD', 'Bangladesh', 'بنغلاديش'),
    ('BB', 'Barbados', 'باربادوس'),
    ('BY', 'Belarus', 'بيلاروسيا'),
    ('BE', 'Belgium', 'بلجيكا'),
    ('BZ', 'Belize', 'بليز'),
    ('BJ', 'Benin', 'بنين'),
    ('BM', 'Bermuda', 'برمودا'),
    ('BT', 'Bhutan', 'بوتان'),
    ('BO', 'Bolivia', 'بوليفيا'),
    ('BA', 'Bosnia and Herzegovina', 'البوسنة والهرسك'),
    ('BW', 'Botswana', 'بوتسوانا'),
    ('BR', 'Brazil', 'البرازيل'),
    ('IO', 'British Indian Ocean Territory', 'إقليم المحيط البريطاني الهندي'),
    ('BN', 'Brunei Darussalam', 'بروناي'),
    ('BG', 'Bulgaria', 'بلغاريا'),
    ('BF', 'Burkina Faso', 'بوركينا فاسو'),
    ('BI', 'Burundi', 'بوروندي'),
    ('KH', 'Cambodia', 'كمبوديا'),
    ('CM', 'Cameroon', 'الكاميرون'),
    ('CA', 'Canada', 'كندا'),
    ('CV', 'Cape Verde', 'الرأس الأخضر'),
    ('KY', 'Cayman Islands', 'جزر كايمان'),
    ('CF', 'Central African Republic', 'جمهورية أفريقيا الوسطى'),
    ('TD', 'Chad', 'تشاد'),
    ('CL', 'Chile', 'تشيلي'),
    ('CN', 'China', 'الصين'),
    ('CX', 'Christmas Island', 'جزيرة كريسماس'),
    ('CC', 'Cocos (Keeling) Islands', 'جزر كوكوس'),
    ('CO', 'Colombia', 'كولومبيا'),
    ('KM', 'Comoros', 'جزر القمر'),
    ('CG', 'Congo', 'الكونغو'),
    ('CD', 'Congo, the Democratic Republic of the', 'جمهورية الكونغو الديمقراطية'),
    ('CK', 'Cook Islands', 'جزر كوك'),
    ('CR', 'Costa Rica', 'كوستاريكا'),
    ('CI', 'Cote DIvoire', 'ساحل العاج'),
    ('HR', 'Croatia', 'كرواتيا'),
    ('CU', 'Cuba', 'كوبا'),
    ('CY', 'Cyprus', 'قبرص'),
    ('CZ', 'Czech Republic', 'جمهورية التشيك'),
    ('DK', 'Denmark', 'الدنمارك'),
    ('DJ', 'Djibouti', 'جيبوتي'),
    ('DM', 'Dominica', 'دومينيكا'),
    ('DO', 'Dominican Republic', 'جمهورية الدومينيكان'),
    ('EC', 'Ecuador', 'الإكوادور'),
    ('EG', 'Egypt', 'مصر'),
    ('SV', 'El Salvador', 'السلفادور'),
    ('GQ', 'Equatorial Guinea', 'غينيا الاستوائية'),
    ('ER', 'Eritrea', 'إريتريا'),
    ('EE', 'Estonia', 'إستونيا'),
    ('ET', 'Ethiopia', 'إثيوبيا'),
    ('FK', 'Falkland Islands (Malvinas)', 'جزر فوكلاند'),
    ('FO', 'Faroe Islands', 'جزر فارو'),
    ('FJ', 'Fiji', 'فيجي'),
    ('FI', 'Finland', 'فنلندا'),
    ('FR', 'France', 'فرنسا'),
    ('GF', 'French Guiana', 'غويانا الفرنسية'),
    ('PF', 'French Polynesia', 'بولينيزيا الفرنسية'),
    ('GA', 'Gabon', 'الغابون'),
    ('GM', 'Gambia', 'غامبيا'),
    ('GE', 'Georgia', 'جورجيا'),
    ('DE', 'Germany', 'ألمانيا'),
    ('GH', 'Ghana', 'غانا'),
    ('GI', 'Gibraltar', 'جبل طارق'),
    ('GR', 'Greece', 'اليونان'),
    ('GL', 'Greenland', 'جرينلاند'),
    ('GD', 'Grenada', 'غرينادا'),
    ('GP', 'Guadeloupe', 'غوادلوب'),
    ('GU', 'Guam', 'غوام'),
    ('GT', 'Guatemala', 'غواتيمالا'),
    ('GN', 'Guinea', 'غينيا'),
    ('GW', 'Guinea-Bissau', 'غينيا بيساو'),
    ('GY', 'Guyana', 'غيانا'),
    ('HT', 'Haiti', 'هايتي'),
    ('HN', 'Honduras', 'هندوراس'),
    ('HK', 'Hong Kong', 'هونغ كونغ'),
    ('HU', 'Hungary', 'المجر'),
    ('IS', 'Iceland', 'آيسلندا'),
    ('IN', 'India', 'الهند'),
    ('ID', 'Indonesia', 'إندونيسيا'),
    ('IR', 'Iran, Islamic Republic of', 'إيران'),
    ('IQ', 'Iraq', 'العراق'),
    ('IE', 'Ireland', 'أيرلندا'),
    ('IL', 'Israel', 'إسرائيل'),
    ('IT', 'Italy', 'إيطاليا'),
    ('JM', 'Jamaica', 'جامايكا'),
    ('JP', 'Japan', 'اليابان'),
    ('JO', 'Jordan', 'الأردن'),
    ('KZ', 'Kazakhstan', 'كازاخستان'),
    ('KE', 'Kenya', 'كينيا'),
    ('KI', 'Kiribati', 'كيريباتي'),
    ('KP', 'North Korea', 'كوريا الشمالية'),
    ('KR', 'South Korea', 'كوريا الجنوبية'),
    ('KW', 'Kuwait', 'الكويت'),
    ('KG', 'Kyrgyzstan', 'قيرغيزستان'),
    ('LA', 'Lao People''s Democratic Republic', 'لاوس'),
    ('LV', 'Latvia', 'لاتفيا'),
    ('LB', 'Lebanon', 'لبنان'),
    ('LS', 'Lesotho', 'ليسوتو'),
    ('LR', 'Liberia', 'ليبيريا'),
    ('LY', 'Libya', 'ليبيا'),
    ('LI', 'Liechtenstein', 'ليختنشتاين'),
    ('LT', 'Lithuania', 'ليتوانيا'),
    ('LU', 'Luxembourg', 'لوكسمبورغ'),
    ('MO', 'Macao', 'ماكاو'),
    ('MK', 'North Macedonia', 'مقدونيا الشمالية'),
    ('MG', 'Madagascar', 'مدغشقر'),
    ('MW', 'Malawi', 'مالاوي'),
    ('MY', 'Malaysia', 'ماليزيا'),
    ('MV', 'Maldives', 'جزر المالديف'),
    ('ML', 'Mali', 'مالي'),
    ('MT', 'Malta', 'مالطا'),
    ('MH', 'Marshall Islands', 'جزر مارشال'),
    ('MQ', 'Martinique', 'مارتينيك'),
    ('MR', 'Mauritania', 'موريتانيا'),
    ('MU', 'Mauritius', 'موريشيوس'),
    ('YT', 'Mayotte', 'مايوت'),
    ('MX', 'Mexico', 'المكسيك'),
    ('FM', 'Micronesia, Federated States of', 'ولايات ميكرونيسيا المتحدة'),
    ('MD', 'Moldova, Republic of', 'مولدوفا'),
    ('MC', 'Monaco', 'موناكو'),
    ('MN', 'Mongolia', 'منغوليا'),
    ('ME', 'Montenegro', 'الجبل الأسود'),
    ('MS', 'Montserrat', 'مونتسرات'),
    ('MA', 'Morocco', 'المغرب'),
    ('MZ', 'Mozambique', 'موزمبيق'),
    ('MM', 'Myanmar', 'ميانمار'),
    ('NA', 'Namibia', 'ناميبيا'),
    ('NR', 'Nauru', 'ناورو'),
    ('NP', 'Nepal', 'نيبال'),
    ('NL', 'Netherlands', 'هولندا'),
    ('NC', 'New Caledonia', 'كاليدونيا الجديدة'),
    ('NZ', 'New Zealand', 'نيوزيلندا'),
    ('NI', 'Nicaragua', 'نيكاراغوا'),
    ('NE', 'Niger', 'النيجر'),
    ('NG', 'Nigeria', 'نيجيريا'),
    ('NU', 'Niue', 'نيوي'),
    ('NF', 'Norfolk Island', 'جزيرة نورفولك'),
    ('MP', 'Northern Mariana Islands', 'جزر ماريانا الشمالية'),
    ('NO', 'Norway', 'النرويج'),
    ('OM', 'Oman', 'عُمان'),
    ('PK', 'Pakistan', 'باكستان'),
    ('PW', 'Palau', 'بالاو'),
    ('PS', 'Palestine, State of', 'فلسطين'),
    ('PA', 'Panama', 'بنما'),
    ('PG', 'Papua New Guinea', 'بابوا غينيا الجديدة'),
    ('PY', 'Paraguay', 'باراغواي'),
    ('PE', 'Peru', 'بيرو'),
    ('PH', 'Philippines', 'الفلبين'),
    ('PL', 'Poland', 'بولندا'),
    ('PT', 'Portugal', 'البرتغال'),
    ('PR', 'Puerto Rico', 'بورتوريكو'),
    ('QA', 'Qatar', 'قطر'),
    ('RE', 'Reunion', 'ريونيون'),
    ('RO', 'Romania', 'رومانيا'),
    ('RU', 'Russian Federation', 'روسيا'),
    ('RW', 'Rwanda', 'رواندا'),
    ('SH', 'Saint Helena', 'سانت هيلينا'),
    ('KN', 'Saint Kitts and Nevis', 'سانت كيتس ونيفيس'),
    ('LC', 'Saint Lucia', 'سانت لوسيا'),
    ('PM', 'Saint Pierre and Miquelon', 'سان بيير وميكلون'),
    ('VC', 'Saint Vincent and the Grenadines', 'سانت فنسنت والجرينادين'),
    ('WS', 'Samoa', 'ساموا'),
    ('SM', 'San Marino', 'سان مارينو'),
    ('ST', 'Sao Tome and Principe', 'ساو تومي وبرينسيب'),
    ('SA', 'Saudi Arabia', 'المملكة العربية السعودية'),
    ('SN', 'Senegal', 'السنغال'),
    ('RS', 'Serbia', 'صربيا'),
    ('SC', 'Seychelles', 'سيشيل'),
    ('SL', 'Sierra Leone', 'سيراليون'),
    ('SG', 'Singapore', 'سنغافورة'),
    ('SK', 'Slovakia', 'سلوفاكيا'),
    ('SI', 'Slovenia', 'سلوفينيا'),
    ('SB', 'Solomon Islands', 'جزر سليمان'),
    ('SO', 'Somalia', 'الصومال'),
    ('ZA', 'South Africa', 'جنوب أفريقيا'),
    ('ES', 'Spain', 'إسبانيا'),
    ('LK', 'Sri Lanka', 'سريلانكا'),
    ('SD', 'Sudan', 'السودان'),
    ('SR', 'Suriname', 'سورينام'),
    ('SZ', 'Eswatini', 'إسواتيني'),
    ('SE', 'Sweden', 'السويد'),
    ('CH', 'Switzerland', 'سويسرا'),
    ('SY', 'Syrian Arab Republic', 'سوريا'),
    ('TW', 'Taiwan', 'تايوان'),
    ('TJ', 'Tajikistan', 'طاجيكستان'),
    ('TZ', 'Tanzania, United Republic of', 'تنزانيا'),
    ('TH', 'Thailand', 'تايلاند'),
    ('TL', 'Timor-Leste', 'تيمور الشرقية'),
    ('TG', 'Togo', 'توغو'),
    ('TK', 'Tokelau', 'توكيلاو'),
    ('TO', 'Tonga', 'تونغا'),
    ('TT', 'Trinidad and Tobago', 'ترينيداد وتوباغو'),
    ('TN', 'Tunisia', 'تونس'),
    ('TR', 'Turkey', 'تركيا'),
    ('TM', 'Turkmenistan', 'تركمانستان'),
    ('TC', 'Turks and Caicos Islands', 'جزر توركس وكايكوس'),
    ('TV', 'Tuvalu', 'توفالو'),
    ('UG', 'Uganda', 'أوغندا'),
    ('UA', 'Ukraine', 'أوكرانيا'),
    ('AE', 'United Arab Emirates', 'الإمارات العربية المتحدة'),
    ('GB', 'United Kingdom', 'المملكة المتحدة'),
    ('US', 'United States', 'الولايات المتحدة'),
    ('UY', 'Uruguay', 'الأوروغواي'),
    ('UZ', 'Uzbekistan', 'أوزبكستان'),
    ('VU', 'Vanuatu', 'فانواتو'),
    ('VE', 'Venezuela', 'فنزويلا'),
    ('VN', 'Viet Nam', 'فيتنام'),
    ('VG', 'Virgin Islands, British', 'جزر العذراء البريطانية'),
    ('VI', 'Virgin Islands, U.S.', 'جزر العذراء الأمريكية'),
    ('WF', 'Wallis and Futuna', 'واليس وفوتونا'),
    ('EH', 'Western Sahara', 'الصحراء الغربية'),
    ('YE', 'Yemen', 'اليمن'),
    ('ZM', 'Zambia', 'زامبيا'),
    ('ZW', 'Zimbabwe', 'زيمبابوي')
ON CONFLICT (code) DO NOTHING;

-- Table for cities
CREATE TABLE IF NOT EXISTS cities (
    country_code VARCHAR(5) NOT NULL,
    city_code VARCHAR(10) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    PRIMARY KEY (country_code, city_code)
);

INSERT INTO cities(country_code, city_code, name_ar, name_en) VALUES
    ('LY','BEN','بنغازي','Benghazi'),
    ('LY','TRP','طرابلس','Tripoly')
ON CONFLICT (country_code, city_code) DO NOTHING;

CREATE TABLE IF NOT EXISTS income_sources (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_ar VARCHAR(100) NOT NULL
);

INSERT INTO income_sources (name_en, name_ar) VALUES
    -- Standard Employment Income
    ('Salary', 'راتب'),
    ('Wages', 'أجور'),
    ('Bonus', 'مكافأة'),
    ('Commission', 'عمولة'),
    ('Overtime Pay', 'أجر العمل الإضافي'),
    ('Tips / Gratuities', 'بقشيش / إكراميات'),

    -- Business & Self-Employment Income
    ('Business Profit', 'ربح تجاري'),
    ('Freelance / Contracting', 'عمل حر / تعاقد'),
    ('Consulting Fees', 'أتعاب استشارية'),
    ('Sales Revenue', 'إيرادات المبيعات'),
    ('Farming / Agriculture', 'دخل زراعي'),
    
    -- Investment Income
    ('Investment', 'استثمار'),
    ('Stock Dividends', 'أرباح الأسهم'),
    ('Interest Income', 'إيرادات الفوائد'),
    ('Capital Gains', 'أرباح رأسمالية'),
    ('Annuity Payments', 'دفعات سنوية'),

    -- Rental Income
    ('Property Rental', 'إيجار عقارات'),
    ('Land Lease', 'إيجار أرض'),
    ('Vehicle Rental', 'إيجار مركبات'),
    ('Equipment Rental', 'إيجار معدات'),
    
    -- Intellectual Property & Royalties
    ('Royalties', 'عائدات'),
    ('Book Royalties', 'عائدات الكتب'),
    ('Music Royalties', 'عائدات الموسيقى'),
    ('Patent Licensing', 'ترخيص براءة اختراع'),

    -- Retirement & Benefits
    ('Pension', 'معاش تقاعدي'),
    ('Social Security', 'الضمان الاجتماعي'),
    ('Retirement Fund Withdrawal', 'سحب من صندوق التقاعد'),

    -- Government & Private Assistance
    ('Government Assistance', 'مساعدات حكومية'),
    ('Unemployment Benefits', 'إعانات البطالة'),
    ('Disability Benefits', 'إعانات العجز'),
    ('Scholarship / Grant', 'منحة دراسية'),
    ('Alimony / Spousal Support', 'نفقة'),
    
    -- Miscellaneous Income
    ('Gift', 'هبة / هدية'),
    ('Inheritance', 'ميراث'),
    ('Lottery / Winnings', 'يانصيب / أرباح'),
    ('Hobby Income', 'دخل من هواية'),
    ('Other', 'أخرى')
ON CONFLICT (name_en) DO NOTHING;

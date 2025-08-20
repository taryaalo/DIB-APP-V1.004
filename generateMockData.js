const { Client } = require('pg');

// Database connection configuration
const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'dib_app_data',
    password: '',
    port: 5432,
};

async function insertMockData() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('Connected to the database.');

        // Mock data for one customer
        const referenceNumber = 'MOCK-001';
        const personalInfo = {
            full_name: 'John Doe',
            first_name: 'John',
            middle_name: 'M',
            last_name: 'Doe',
            passport_number: 'P123456',
            passport_issue_date: '2022-01-01',
            passport_expiry_date: '2032-01-01',
            birth_place: 'New York',
            dob: '1990-05-15',
            gender: 'Male',
            nationality: 'US',
            family_record_number: 'F789012',
            national_id: '1990051512345',
            phone: '123-456-7890',
            email: 'john.doe@example.com',
            residence_expiry: '2025-01-01',
            census_card_number: 'C12345',
            reference_number: referenceNumber,
            ai_model: 'mock',
            service_type: 'individual',
            manual_fields: [],
            mother_full_name: 'Jane Doe',
            marital_status: 'Single',
            branch_id: 101, // Main Branch
            language: 'en'
        };

        const addressInfo = {
            reference_number: referenceNumber,
            country: 'US',
            city: 'New York',
            area: 'Manhattan',
            residential_address: '123 Main St, New York, NY 10001'
        };

        const workIncomeInfo = {
            reference_number: referenceNumber,
            employment_status: 'Employed',
            job_title: 'Software Engineer',
            employer: 'Tech Corp',
            employer_address: '456 Tech Ave, New York, NY 10002',
            employer_phone: '987-654-3210',
            source_of_income: 'Salary',
            monthly_income: '5000',
            work_country: 'US',
            work_city: 'New York',
            work_sector: 'Technology',
            field_of_work: 'Software Development',
            work_start_date: '2020-01-15'
        };

        // Insert into personal_info
        const personalInfoQuery = {
            text: `INSERT INTO personal_info(full_name, first_name, middle_name, last_name, passport_number, passport_issue_date, passport_expiry_date, birth_place, dob, gender, nationality, family_record_number, national_id, phone, email, residence_expiry, census_card_number, reference_number, ai_model, service_type, manual_fields, mother_full_name, marital_status, branch_id, language)
                   VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING id`,
            values: Object.values(personalInfo)
        };
        const personalInfoRes = await client.query(personalInfoQuery);
        const personalId = personalInfoRes.rows[0].id;
        console.log('Inserted personal_info for', personalInfo.full_name);

        // Insert into address_info
        addressInfo.personal_id = personalId;
        addressInfo.national_id = personalInfo.national_id;
        const addressInfoQuery = {
            text: `INSERT INTO address_info(personal_id, national_id, reference_number, country, city, area, residential_address)
                   VALUES($1, $2, $3, $4, $5, $6, $7)`,
            values: [personalId, personalInfo.national_id, addressInfo.reference_number, addressInfo.country, addressInfo.city, addressInfo.area, addressInfo.residential_address]
        };
        await client.query(addressInfoQuery);
        console.log('Inserted address_info for', personalInfo.full_name);

        // Insert into work_income_info
        workIncomeInfo.personal_id = personalId;
        workIncomeInfo.national_id = personalInfo.national_id;
        const workIncomeInfoQuery = {
            text: `INSERT INTO work_income_info(personal_id, national_id, reference_number, employment_status, job_title, employer, employer_address, employer_phone, source_of_income, monthly_income, work_country, work_city, work_sector, field_of_work, work_start_date)
                   VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            values: [personalId, personalInfo.national_id, workIncomeInfo.reference_number, workIncomeInfo.employment_status, workIncomeInfo.job_title, workIncomeInfo.employer, workIncomeInfo.employer_address, workIncomeInfo.employer_phone, workIncomeInfo.source_of_income, workIncomeInfo.monthly_income, workIncomeInfo.work_country, workIncomeInfo.work_city, workIncomeInfo.work_sector, workIncomeInfo.field_of_work, workIncomeInfo.work_start_date]
        };
        await client.query(workIncomeInfoQuery);
        console.log('Inserted work_income_info for', personalInfo.full_name);


    } catch (err) {
        console.error('Error inserting mock data:', err);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

insertMockData();

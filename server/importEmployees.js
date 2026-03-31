const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Paths
const csvPath = path.join(__dirname, '..', 'Employee_dsax.csv');
const employeesPath = path.join(__dirname, '..', 'data', 'employees.json');
const balancesPath = path.join(__dirname, '..', 'data', 'leave_balances.json');

// Read CSV file
function readCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });
        data.push(row);
    }
    return data;
}

// Clean email and phone
function cleanEmail(email) {
    if (!email) return '';
    return email.replace(/\s+/g, '').toLowerCase();
}

function formatPhone(phone) {
    if (!phone) return '';
    // Remove spaces and convert scientific notation if needed
    let cleaned = phone.replace(/\s+/g, '');
    // Handle scientific notation (e.g., 8.56205E+12)
    if (cleaned.includes('E+')) {
        cleaned = parseFloat(cleaned).toString();
    }
    return cleaned;
}

// Main import function
async function importEmployees() {
    try {
        console.log('🚀 Starting Employee Import...\n');

        // Read CSV data
        console.log('📄 Reading CSV file...');
        const csvData = readCSV(csvPath);
        console.log(`   Found ${csvData.length} records in CSV\n`);

        // Read existing employees
        console.log('📊 Reading existing employees...');
        const employees = JSON.parse(fs.readFileSync(employeesPath, 'utf-8'));
        console.log(`   Current employees: ${employees.length}\n`);

        // Read existing leave balances
        const balances = JSON.parse(fs.readFileSync(balancesPath, 'utf-8'));

        const now = new Date().toISOString();
        const today = new Date().toISOString().split('T')[0];
        const currentYear = new Date().getFullYear();

        let importedCount = 0;
        let skippedCount = 0;

        console.log('⚙️  Processing CSV records...\n');

        csvData.forEach(row => {
            const empCode = row['staff id'];

            // Skip if no employee code
            if (!empCode) {
                return;
            }

            // Check if already exists
            const exists = employees.find(emp => emp.empCode === empCode);
            if (exists) {
                console.log(`   ⏭️  Skipped ${empCode} (already exists)`);
                skippedCount++;
                return;
            }

            // Create employee object
            const fullName = `${row['name']} ${row['last name']}`.trim();
            const newEmployee = {
                id: uuidv4(),
                empCode: empCode,
                fullName: fullName,
                email: cleanEmail(row['email']),
                phone: formatPhone(row['phone']),
                department: '',
                position: row['position'] || '',
                baseSalary: 0,
                pin: '1111',
                role: 'user',
                hireDate: today,
                status: 'active',
                gender: row['gender'] || '',
                dob: row['dob'] || '',
                nickName: row['nick name'] || '',
                createdAt: now,
                updatedAt: now
            };

            employees.push(newEmployee);

            // Create leave balance
            balances.push({
                id: uuidv4(),
                employeeId: newEmployee.id,
                year: currentYear,
                annualQuota: 15,
                annualUsed: 0,
                annualRemaining: 15,
                sickQuota: 30,
                sickUsed: 0,
                sickRemaining: 30,
                updatedAt: now
            });

            console.log(`   ✅ Imported ${empCode} - ${fullName}`);
            importedCount++;
        });

        // Save updated data
        console.log('\n💾 Saving data...');
        fs.writeFileSync(employeesPath, JSON.stringify(employees, null, 2));
        fs.writeFileSync(balancesPath, JSON.stringify(balances, null, 2));

        console.log('\n✨ Import Complete!\n');
        console.log('═'.repeat(50));
        console.log(`   Total employees: ${employees.length}`);
        console.log(`   Newly imported: ${importedCount}`);
        console.log(`   Skipped (duplicates): ${skippedCount}`);
        console.log('═'.repeat(50));
        console.log('\n📝 Default credentials for new employees:');
        console.log('   PIN: 1111');
        console.log('   Role: user\n');

    } catch (error) {
        console.error('❌ Import failed:', error.message);
        process.exit(1);
    }
}

// Run import
importEmployees();

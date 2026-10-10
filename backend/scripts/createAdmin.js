const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function createAdmin() {
    try {
        const adminName = 'System Admin';
        const adminEmail = 'admin@travelgo.com';
        const adminPhone = '+1 555-0199';
        const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

        console.log(`Hashing password for admin account: ${adminEmail}...`);
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(rawPassword, saltRounds);

        // Check if admin user already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

        if (existing.length > 0) {
            // Update existing user to admin with new password hash
            await pool.query(
                'UPDATE users SET name = ?, phone = ?, password_hash = ?, role = ? WHERE email = ?',
                [adminName, adminPhone, password_hash, 'admin', adminEmail]
            );
            console.log(`Admin user '${adminEmail}' already exists. Password & role updated successfully.`);
        } else {
            // Insert new admin user
            await pool.query(
                'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
                [adminName, adminEmail, adminPhone, password_hash, 'admin']
            );
            console.log(`Admin user '${adminEmail}' created successfully! Password: ${rawPassword}`);
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

createAdmin();

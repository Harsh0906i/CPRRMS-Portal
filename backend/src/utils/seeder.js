const User = require('../models/User');

const seedSuperAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'Super Admin' });
    
    if (adminCount === 0) {
      console.log('No Super Admin found. Seeding default Super Admin...');
      
      const defaultAdmin = await User.create({
        name: 'ICSR Super Admin',
        email: 'superadmin@icsr.org',
        password: 'Password123!', // will be hashed by pre-save hook
        role: 'Super Admin',
        status: 'Active'
      });
      
      console.log(`Default Super Admin created: ${defaultAdmin.email} (Password: Password123!)`);
    } else {
      console.log('Super Admin already exists. Seeding skipped.');
    }
  } catch (error) {
    console.error(`Error seeding Super Admin: ${error.message}`);
  }
};

module.exports = seedSuperAdmin;

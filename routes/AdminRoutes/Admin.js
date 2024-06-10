const express = require('express');
const { Admin } = require('../../models/AdminSchema/AdminSchema');
const { Business } = require('../../models/MerchantSchema/MerchantSchema');
const router = express.Router();

// Route to handle admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find the admin by username and password
    const admin = await Admin.findOne({ username, password });

    // Check if admin exists
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If admin exists, you can create a session or token for authentication
    // For simplicity, let's just send a success message
    return res.status(200).json({ message: 'Login successful',  merchantRead: admin.merchantRead, merchantEdit: admin.merchantEdit, SuperAdmin: admin.SuperAdmin, userRead: admin.userRead});

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to handle admin creation
router.post('/create-admin', async (req, res) => {
    try {
      const { username, password,permissions } = req.body;
       console.log(username,password,permissions);
      // Check if username and password are provided
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
  
      // Check if the admin already exists
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        return res.status(409).json({ error: 'Admin with this username already exists' });
      }
  
      // Create a new admin
      const newAdmin = new Admin({ username, password,merchantRead:permissions.merchantRead,merchantEdit:permissions.merchantEdit,SuperAdmin:permissions.SuperAdmin,userRead:permissions.userRead });
  
      // Save the admin to the database
      await newAdmin.save();
  
      return res.status(201).json({ message: 'Admin created successfully' ,success: true});
  
    } catch (error) {
      console.error('Error creating admin:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//get number of unverified businesses 

  router.get('/unverifiedcount', async (req, res) => {
    try {
      const unverifiedUsersCount = await Business.countDocuments({ isVerified: false });
      res.json({ unverifiedUsersCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //get number of verified businesses 

  router.get('/verifiedcount', async (req, res) => {
    try {
      const verifiedUsersCount = await Business.countDocuments({ isVerified: true });
      res.json({ verifiedUsersCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
   
  router.get('/getalladmins', async (req, res) => {
    try {
      const admins = await Admin.find();
      res.send(admins);
    } catch (err) {
      console.error("Error while fetching admins:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  router.get('/getpermissions/:email', async (req, res) => {
    const email = req.params.email;

    try {
        // Find admin by email
        const admin = await Admin.findOne({ username: email });

        // If admin not found
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        // Check if the required fields exist
        if ('merchantRead' in admin || 'SuperAdmin' in admin || 'userRead' in admin) {
            // Extract required permissions
            const { merchantRead, SuperAdmin, merchantEdit, userRead } = admin;

            // Send permissions as JSON response
            res.json({
                merchantRead,
                SuperAdmin,
                merchantEdit,
                userRead
            });
        } else {
            // Admin is a super admin
            res.json({ superAdmin: true });
        }
    } catch (err) {
        console.error("Error while fetching admin permissions:", err);
        res.status(500).send("Internal Server Error");
    }
});
  
module.exports = router;

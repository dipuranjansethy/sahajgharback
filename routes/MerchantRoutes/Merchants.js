const express = require('express');
const router =  express.Router();
const jwt = require('jsonwebtoken');
const { Business } = require('../../models/MerchantSchema/MerchantSchema');


// Replace 'YOUR_SECRET_KEY' with your own secret key for JWT
const SECRET_KEY = 'ecommerce_123';


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ message: 'Token not provided' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token' });


    req.user = decoded;

    next();
  });
};

// Routes

// Authentication route
router.post('/api/auth', (req, res) => {
  const { email, password } = req.body; 
  //  authentication mechanism
  if (email === 'user@example.com' && password === 'password') {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '24h' });

    res.json({ token });
  } else {
    res.status(401).json({ message: 'Authentication failed' });
  }
}); 


// CRUD routes for Business model
// Create a new business
// POST route to save business data
// CRUD routes for Business model

// Create a new business
// POST route to save business data
router.post('/add-business', async (req, res) => {
  try {
    const {
      gstHolderName,
      adhar,
      pan,
      phoneNumber,
      gstPapers,
      // Add other unique fields as needed
    } = req.body;

    // Check if a business with the same unique fields already exists
    const existingBusiness = await Business.findOne({
      $or: [
        { gstHolderName },
        { adhar },
        { pan },
        { phoneNumber : phoneNumber.replace(/\D/g, '') },
        { gstPapers },
        // Add other unique fields as needed
      ],
    });

    if (existingBusiness) {
      // Business with duplicate values already exists
      return res.status(400).json({ message: 'Duplicate business registration data' });
    }

    // If no duplicate, proceed to create a new business instance
    const newBusiness = new Business(req.body);

    // Saving the new business data to the database
    const savedBusiness = await newBusiness.save();

    res.status(201).json(savedBusiness);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
//check the number already registered or not
router.get('/checkPhoneNumber/:phoneNumber', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber.replace(/\D/g, '');

    // Check if the phone number exists in the database
    const existingBusiness = await Business.findOne({ phoneNumber });

    if (existingBusiness) {
      res.json({ success: true, message: 'Phone number is already registered.' });
    } else {
      res.json({ success: false, message: 'Phone number is not registered.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
 
// Route to check if a phone number is verified
router.get('/check-verification/:phoneNumber', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber.replace(/\D/g, '');

    // Find the business with the given phone number
    const business = await Business.findOne({ phoneNumber });

    if (!business) {
      return res.status(404).json({ message: 'Business not found for the provided phone number', success: false });
    }

    // Check if the business is verified
    if (business.isVerified) {
      return res.json({ message: 'Phone number is verified', success: true});
    } else {
      return res.json({ message: 'Phone number is not verified', success: false  });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', success: false  });
  }
});
// Read all businesses
router.get('/api/businesses', async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Route to handle POST request for adding basic information
router.post('/addbasicinfo', async (req, res) => {
  try {
    const {
      businessName,
      phoneNumber,
      buildingName,
      landmark,
      city,
      state,
      pincode,
      fcmToken,
      area,
      contactPerson,
      whatsappNumber,
      landlineNumber,
      anotherMobileNumber,
      email,

      description
    } = req.body;
     const phoneNumberMain = phoneNumber.replace(/\D/g, '');
    // Assuming you have an Otp model or logic to verify OTP
    // Replace the following line with your OTP verification logic

     // Check if a business with the same unique fields already exists
     const existingBusiness = await Business.findOne({
      $or: [
       
        { phoneNumber : phoneNumberMain }
        // Add other unique fields as needed
      ],
    });

    if (existingBusiness) {
      // Business with duplicate values already exists
      return res.status(400).json({ message: 'Duplicate business registration data' });
    }


    const isOtpValid = true;

    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const newBusiness = new Business({
      businessName,
      phoneNumber: phoneNumberMain,
      blockBuildingName: buildingName,
      landmark,
      city,
      state,
      fcmToken,
      pincode,
      area,
      merchantName: contactPerson,
      whatsapp: whatsappNumber,
      landlineNumber,
      anotherMobileNumber,
      email,
      description,
      isBasicInfo: true,
    });

    // Save the new business to the database
    await newBusiness.save();
     console.log("hii");
    return res.status(201).json({ message: 'Basic information added successfully' ,success:true});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Update FCM token by phone number
router.put('/update-fcm/:phoneNumber', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber.replace(/\D/g, '');
    const { fcmToken } = req.body;

    // Validate the request body
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required.' });
    }

    // Find the business by phone number
    const business = await Business.findOne({ phoneNumber });

    if (!business) {
      return res.status(404).json({ error: 'Business not found with the given phone number.' });
    }

    // Update the FCM token
    business.fcmToken = fcmToken;

    // Save the updated business document
    await business.save();

    return res.json({ message: 'FCM token updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Route to handle GET request for business details by phone number
router.get('/getregisteredsteps/:phoneNumber', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber.replace(/\D/g, ''); // Remove non-numeric characters

    // Log the received phone number for debugging
    console.log("Received phone number:", phoneNumber);

    // Find the business by phone number
    const business = await Business.findOne({ phoneNumber:phoneNumber });

    // Log the retrieved business for debugging
    console.log("Retrieved business:", business);

    if (!business) {
      console.log(phoneNumber, "Business not found");
      return res.status(404).json({ message: 'Business not found' });
    }

    // Return the relevant details based on your requirements
    const businessDetails = {
      isBasicInfo: business.isBasicInfo,
      isBusinessInfo: business.isBusinessInfo,
      isGovLicenses: business.isGovLicenses,
      isUploadedDocs: business.isUploadedDocs,
      // Include other relevant details you want to expose
    };

    return res.status(200).json({ businessDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.post('/saveOrUpdateBusinessInfo', async (req, res) => {
  try {
    const { phoneNumber, category, subcategory, openTime, closingTime ,businessDays} = req.body;

    // Check if a business with the provided phone number exists
    const existingBusiness = await Business.findOne({ phoneNumber });

    if (existingBusiness) {
      // Update existing business data
      existingBusiness.category = category;
      existingBusiness.subcategory = subcategory;
      existingBusiness.openingHour = openTime;
      existingBusiness.closingHour = closingTime;
      existingBusiness.businessDays = businessDays

      existingBusiness.isBusinessInfo = true;

      await existingBusiness.save();
      res.status(200).json({ message: 'Business data updated successfully' });
    } else {
      // Create a new business record
      const newBusiness = new Business({
        phoneNumber : phoneNumber.replace(/\D/g, ''),
        category,
        subcategory,
        openingHour: openTime,
        closingHour: closingTime,
        businessDays,
        isBusinessInfo  : true
      });

      await newBusiness.save();
      res.status(201).json({ message: 'New business created successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/saveOrUpdategovLicenses', async (req, res) => {
  try {
    const { 
      adhar,
      pan,
      phoneNumber,
      gstNumber, 
      gstHolderName, } = req.body;
      const phoneNumberMain = phoneNumber.replace(/\D/g, '');
    // Check if a business with the provided phone number exists
    const existingBusiness = await Business.findOne({ phoneNumber  : phoneNumberMain});

    if (existingBusiness) {
      // Update existing business data
      existingBusiness.adhar = adhar;
      existingBusiness.pan = pan;
      existingBusiness.gstHolderName = gstHolderName;
      existingBusiness.gstNumber = gstNumber;
      existingBusiness.isGovLicenses = true;

      await existingBusiness.save();
      res.status(200).json({ message: 'Business data updated successfully' });
    } else {
      // Create a new business record
      const newBusiness = new Business({
        phoneNumber: phoneNumberMain,
        adhar,
        pan,
       gstNumber, 
       gstHolderName,
        isGovLicenses  : true
      });

      await newBusiness.save();
      res.status(201).json({ message: 'New business created successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.post('/saveOrUpdateImages', async (req, res) => {
  try {
    const { 
      phoneNumber,
      imagesWithDescriptions
      } = req.body;

    // Check if a business with the provided phone number exists
    const existingBusiness = await Business.findOne({ phoneNumber : phoneNumber.replace(/\D/g, '')});

    if (existingBusiness) {
      // Update existing business data
       existingBusiness.imagesWithDescriptions = imagesWithDescriptions;
      existingBusiness.isUploadedDocs = true;

      await existingBusiness.save();
      res.status(200).json({ message: 'Business data updated successfully' });
    } else {
      // Create a new business record
      const newBusiness = new Business({
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        imagesWithDescriptions,
        isUploadedDocs  : true
      });

      await newBusiness.save();
      res.status(201).json({ message: 'New business created successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Read a specific business by ID
router.get('/api/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/api/businessesmobile/:phoneNumber', async (req, res) => {
  try {
    const business = await Business.findOne({phoneNumber : req.params.phoneNumber.replace(/\D/g, '')});
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a business by ID
router.put('/api/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a business by ID
router.delete('/api/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// isVerified  - Activation
// Set isVerified to true for a specific business
router.put('/verify/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({ message: 'Business verified successfully', business });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//  DeActivation 
// Set isVerified to false for a specific business
router.put('/unverify/:id', async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({ message: 'Business unverified successfully', business });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API endpoint to save shopImages and update isDeatilsFull to true by phone number
router.post('/updateDetailsByPhoneNumber', async (req, res) => {
  try {
    const { phoneNumber, shopImages } = req.body;

    if (!phoneNumber || !shopImages || !Array.isArray(shopImages)) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    // Find the business by phone number
    const business = await Business.findOne({ phoneNumber : phoneNumber.replace(/\D/g, '') });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Update shopImages and isDeatilsFull
    business.shopImages = shopImages;
    business.isDeatilsFull = true;

    // Save the updated business
    await business.save();

    return res.status(200).json({ message: 'Details updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

     // Route to get categories and subcategories
    router.get('/categories', async (req, res) => {
     try {
     const categories = await Business.find().distinct('category').exec();
    const subcategories = await Business.find().distinct('subcategory').exec();

    res.json({ categories, subcategories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router
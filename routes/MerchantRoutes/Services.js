const express = require('express');
const { Business } = require('../../models/MerchantSchema/MerchantSchema');
const router = express.Router();
const { Service } = require('../../models/MerchantSchema/ServiceSchema');

// Create a new Service
router.post('/services', async (req, res) => {
  try {
    const newService = await Service.create(req.body);
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Route to get all services by phone number
router.get('/services/:phoneNumber', async (req, res) => {
    try {
      const phoneNumber = req.params.phoneNumber.replace(/\D/g, '');
  
      // Find the business with the given phone number
      const business = await Business.findOne({ phoneNumber });
  
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }
  
      // Find all services associated with the business
      const services = await Service.find({ business: business._id });
  
      res.json(services);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Route to get all services by phone number
router.get('/business-services/:id', async (req, res) => {
  try {

    // Find the business with the given phone number
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Find all services associated with the business
    const services = await Service.find({ business: business._id });

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all services - admin
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific Service by ID
router.get('/servicesbyid/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('business');
    if (!service) {
      return res.status(404).send({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

});

function formatString(inputString) {
  return inputString.toLowerCase().replace(/\s/g, '');
}
// Search by category (flexible search)
router.get('/search/category/:category', async (req, res) => {
  const rawCategory = req.params.category;

  // Remove spaces and make the search case-insensitive
  const categoryRegex = new RegExp(rawCategory.replace(/\s/g, ''), 'i');

  try {
    const services = await Service.find({
      category: { $regex: categoryRegex }
    }).populate('business');

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint for searching services
router.post('/search', async (req, res) => {
  try {
    const { name, category, subcategory } = req.body;

    // Build the query object based on provided parameters
    const query = {};
    if (name) query.ServicesName = new RegExp(name, 'i'); // Case-insensitive search for name
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    // Perform the query
    const services = await Service.find(query);

    if (services.length === 0) {
      return res.status(404).json({ message: 'No services found matching the criteria.' });
    }

    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Search by subcategory
router.get('/search/subcategory/:subcategory', async (req, res) => {
  const subcategory = req.params.subcategory;

  try {
    const services = await Service.find({ subcategory: { $regex: subcategory, $options: 'i' } }).populate('business');
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by service name
router.get('/search/name/:serviceName', async (req, res) => {
  const serviceName = req.params.serviceName;

  try {
    const services = await Service.find({ ServicesName: { $regex: serviceName, $options: 'i' } }).populate('business');
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Update a Service by ID
router.patch('/services/:id', async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (updatedService) {
      res.status(200).json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a Service by ID
router.delete('/services/:id', async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (deletedService) {
      res.status(200).json({ message: 'Service deleted successfully' ,success:true});
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

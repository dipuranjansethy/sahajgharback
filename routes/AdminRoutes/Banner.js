const express = require('express');
const { Banner } = require('../../models/AdminSchema/Banners');
const router = express.Router()
require("dotenv").config();
const { S3Client, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

//=============================================MY S3 STUFF=============================================
const ACCESS_KEY = process.env.ACCESS_KEY;
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const BUCKET_NAME = process.env.BUCKET_NAME;
const Region = process.env.REGION;
const ENDPOINT = process.env.endpoint;

const s3 = new S3Client({
  region: Region,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: ACCESS_SECRET,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        contentType: file.mimetype,
        ACL: "public-read",
      });
    },
    key: function (req, file, cb) {
      const fileExtension = file.originalname.split(".").pop();
      const uniqueKey = `${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}.${fileExtension}`;
      cb(null, uniqueKey);
    },
  }),
});

router.post("/upload", upload.array("photos", 6), function (req, res, next) {
  const uploadedFiles = req.files.map((file) => {
    return {
      originalname: file.originalname,
      key: file.key,
      location: file.location,
    };
  });

  console.log("Successfully uploaded files:", uploadedFiles);

  res.send(uploadedFiles);
});


const uploadforbanner = multer({
    storage: multerS3({
      s3: s3,
      bucket: BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
          contentType: file.mimetype,
          ACL: "public-read",
        });
      },
      key: function (req, file, cb) {
        const fileExtension = file.originalname.split(".").pop();
        // const uniqueKey = `${Date.now()}-${Math.floor(
        //   Math.random() * 1000
        // )}.${fileExtension}`;
        cb(null, file.originalname);
      },
    }),
  });
  
  router.post("/upload-banner-work", uploadforbanner.array("photos", 6), function (req, res, next) {
    const uploadedFiles = req.files.map((file) => {
      return {
        originalname: file.originalname,
        key: file.key,
        location: file.location,
      };
    });
  
    console.log("Successfully uploaded files:", uploadedFiles);
  
    res.send(uploadedFiles);
  });
  
  
router.get("/images/:key", async (req, res) => {
  try {
    const { key } = req.params;


    const s3Response = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })
    );


    res.set("Content-Type", s3Response.ContentType);
    res.set("Content-Length", s3Response.ContentLength);
    


    s3Response.Body.pipe(res);
  } catch (error) {
    console.error("Error retrieving image from S3:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});


//=============================================MY S3 STUFF=============================================

router.post('/save-adsBanner-banners', async (req, res) => {
  try {
      const { adsBanner } = req.body;

      // Check if a banner document already exists
      let existingBanner = await Banner.findOne();

      if (existingBanner) {
          // Update existing banner document
          existingBanner.adsBanner = adsBanner;
          await existingBanner.save();
      } else {
          // Create a new banner document
          const newBanner = new Banner({
            adsBanner,
          });
          await newBanner.save();
      }

      res.json({ success: true, message: 'Banners saved successfully' });
  } catch (error) {
      console.error('Error saving banners:', error);
      res.status(500).json({ success: false, error: 'Failed to save banners' });
  }
});

router.post('/save-homeBanner-banners', async (req, res) => {
    try {
        const { homeBanner } = req.body;
  
        // Check if a banner document already exists
        let existingBanner = await Banner.findOne();
  
        if (existingBanner) {
            // Update existing banner document
            existingBanner.homeBanner = homeBanner;
            await existingBanner.save();
        } else {
            // Create a new banner document
            const newBanner = new Banner({
                homeBanner,
            });
            await newBanner.save();
        }
  
        res.json({ success: true, message: 'Banners saved successfully' });
    } catch (error) {
        console.error('Error saving banners:', error);
        res.status(500).json({ success: false, error: 'Failed to save banners' });
    }
  });

  router.get('/get-all-banners', async (req, res) => {
    try {
        // Retrieve all documents from the database
        const banners = await Banner.find({}, { homeBanner: 1, adsBanner: 1, _id: 0 });

        // Extract homeBanner and adsBanner arrays from each document
        const homeBanners = banners.map(banner => banner.homeBanner).flat();
        const adsBanners = banners.map(banner => banner.adsBanner).flat();

        res.json({ success: true, homeBanners, adsBanners });
    } catch (error) {
        console.error('Error retrieving banners:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve banners' });
    }
});
  module.exports = router;
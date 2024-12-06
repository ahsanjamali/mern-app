const Car = require("../models/Car");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.submitCar = async (req, res) => {
  try {
    const { model, price, phone, city } = req.body;
    const files = req.files;

    // Validate input
    if (!model || !price || !phone || !city) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate phone number
    if (phone.length !== 11) {
      return res
        .status(400)
        .json({ message: "Phone number must be 11 digits" });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "car-listings",
        });
        imageUrls.push(result.secure_url);
      }
    }

    // Create car listing
    const car = await Car.create({
      model,
      price,
      phone,
      city,
      images: imageUrls,
      user: req.user.userId,
    });

    res.status(201).json(car);
  } catch (error) {
    console.error("Error submitting car:", error);
    res.status(500).json({ message: "Error submitting car listing" });
  }
};

exports.getUserCars = async (req, res) => {
  try {
    const cars = await Car.find({ user: req.user.userId });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Error fetching car listings" });
  }
};

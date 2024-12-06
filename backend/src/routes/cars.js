const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const auth = require("../middleware/auth");
const multer = require("multer");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

router.post("/", auth, upload.array("images", 10), carController.submitCar);
router.get("/user", auth, carController.getUserCars);

module.exports = router;

const express = require("express");

const {
   uploadResume,
   getLatestResume
} = require("../controllers/resumeController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


router.post(
   "/upload",
   authMiddleware,
   upload.single("resume"),
   uploadResume
);

router.get(
   "/latest",
   authMiddleware,
   getLatestResume
);

module.exports = router;
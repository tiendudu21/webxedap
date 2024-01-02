const statisticalController = require("../controllers/statisticalController");
const router = require("express").Router();
const verifyToken = require('../middleware/middleware');

router.get('/count', verifyToken.checkLogin, statisticalController.getAllStatistical);

module.exports = router;
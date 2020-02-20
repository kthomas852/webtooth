const router = require('express').Router();
const webtooth = require('./server/controllers/blueController');

// router.route('/eversleep/auth')
//     .post(sleep.auth);
// router.route('/eversleep')
//     .get(sleep.apiView)
//     .post(sleep.getReadings);
// router.route('/tooth/pair')
//     .get(webtooth.pair);
router.route('/webtooth/logs')
    .post(webtooth.log);

module.exports = router;
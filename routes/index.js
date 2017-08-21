let express = require('express');
let router = express.Router();
let Parser = require('../handler');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
    new Parser(req);
    res.render('index', { title: 'Express' });
});

module.exports = router;

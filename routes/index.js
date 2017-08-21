let express = require('express');
let router = express.Router();
let Parser = require('../handler');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', async function(req, res, next) {
    let parser = new Parser(req);
    let result = await parser.start();
    console.log(result);
    res.json({'result': false})
    // res.render('index', { title: 'Express' });
});

module.exports = router;

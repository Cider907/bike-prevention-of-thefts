const router = require('express').Router();

router.get('/',(req,res,next)=>
{
    res.render('picture.html');
});
module.exports = router;
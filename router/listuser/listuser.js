const router = require('express').Router();

router.get('/',(req,res,next)=>
{
    res.render('listuser.html');
});
module.exports = router;

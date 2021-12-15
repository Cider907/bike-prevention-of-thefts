const router = require('express').Router();

router.get('/',(req,res,next)=>
{
    res.render('login.html');
});
module.exports = router;


const router = require('express').Router();

router.all('*',(req,res,next)=>
{
    res.render('error');
});
module.exports = router;
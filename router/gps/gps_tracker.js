const router = require('express').Router();

router.get('/',(req,res,next)=>
{
    UserModel2.findGPS(function(err,results)
    {
    console.log('gps 데이터 값' + '\n' + results);
    res.render('gps', {lat :results.lat, lon :results.lon})
    });
});
module.exports = router;
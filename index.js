const express = require('express');
const http = require('http');
const fs = require('fs')
const ejs = require("ejs");
const static = require('serve-static');
const path = require('path');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');


//설정
const config = require('./config/config');
const url = config.db_url;
const app = express();
var Schema = mongoose.Schema;
var db
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


//DB 연결
function connectDB()
{
  mongoose.Promise = global.Promise;
  mongoose.connect(url, 
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    db = mongoose.connection;
    db.on("error", (err) => console.error(err));
    db.once("open", () => console.log("mongoose connect"));

    //스키마 모델 정의
    UserState = new Schema(
    {
      id: {type:String, required:true, unique:true},
      password: {type:String, required:true},
      name: {type:String},
      bikename: {type:String},
      bikenumber: {type:String},
      bikebrand: {type:String},
      gps: {type:String},
    });
    UserGps = new Schema
    ({
      lat: {type:String},
      lon: {type:String}
    });
    UserGps.set('collection', 'users');
    console.log('UserSchema 정의');

    UserState.static('findById', function(id, callback) 
    {
       return this.find({id:id},callback);
    });
    UserState.static('findAll', function(callback) 
    {
      return this.find({}, callback);
    });
    UserGps.static('findGPS', function(callback) 
    {
      return this.findOne({}, callback).sort('_id');
    });

    UserModel = mongoose.model('사용자 정보', UserState);
    UserModel2 = mongoose.model('users', UserGps);
    console.log('UserModel 정의');
    
    //포트출력
    app.listen(config.db_port, () => 
    {
      console.log('mongoDB port : %d', config.db_port);
    });
}


//ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile);
app.set('views', './views');


//초기화면 렌더링
app.get('/', function (req, res)
{
  res.render('login.html');
});


//로그인
var router = express.Router();
router.route('/process/login').post(function(req, res)
{
  console.log('/process/login 라우팅 함수 호출됨');

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;

  console.log('요청 파라미터: ' + paramId + ', ' + paramPassword);

  if (db)
  {
    authUser(db, paramId, paramPassword, function(err, docs)
    {
      if (err)
      {
        console.log('에러 발생');
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>에러발생</h1>');
        res.write('<br><br><a href="/login">돌아가기</a>' );
        res.end();
        return;
      }
      if (docs)
      {
        console.dir(docs);
        console.log('에러 발생');
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>사용자 로그인 성공</h1>');
        res.write('<div><p>사용자 : ' + docs[0].name + '</p></div>');
        res.write('<br><br><a href="/login">다시로그인하기</a>' );
        res.write('<br><br><a href="/main">홈으로가기</a>' );
        UserModel2.findGPS(function(err,results){
          console.log(results);
        });
      res.end();
      }
      else
      {
        console.log('에러 발생');
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>사용자 데이터 조회 안됨</h1>');
        res.write('<br><br><a href="/login">돌아가기</a>' );
        res.end();
      }
    });
  }
  else 
  {
    console.log('에러 발생');
    res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
    res.write('<h1>데이터 베이스연결 안됨</h1>');
    res.end();        
  }
});


//사용자 등록
router.route('/process/picture').post(function(req, res) 
{
  console.log('/process/picture 라우팅 함수 호출됨');

  var paramId    =    req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  var paramName  = req.body.name  || req.query.name;
  var paramName1 = req.body.name1 || req.query.name1;
  var paramName2 = req.body.name2 || req.query.name2;
  var paramName3 = req.body.name3 || req.query.name3;
  var paramName4 = req.body.name4 || req.query.name4;

  console.log('요청 파라미터 :' + paramId + ', ' + paramPassword + ', ' + paramName
  + ', ' + paramName1 + ', ' + paramName2 + ', ' + paramName3+ ', ' + paramName4);

  if (db)
  {
    addUser(db, paramId, paramPassword, paramName, paramName1, paramName2, paramName3, paramName4, function(err, results)
    {

      if (err) 
      {
        console.log('에러 발생');
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>에러발생</h1>');
        res.write('<br><br><a href="/login">돌아가기</a>');
        res.end();
        return;
      }
      if (results) 
      {
        console.dir(results);
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>사용자 추가 성공</h1>');
        res.write('<div><p>사용자 : ' + paramName + '</p></div>');
        res.write('<br><br><a href="/login">로그인하기</a>' );
        res.end();
      }
      else
      {
        console.log('에러 발생');
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write('<h1>사용자 추가 안됨</h1>');
        res.end();
      }
    })
  }
  else
  {
    console.log('에러 발생');
    res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
    res.write('<h1>데이터베이스 연결안됨</h1>');
    res.end();
  }
});


//사용자 검색
var authUser = function(db, id, password, callback) {
  console.log('authUser 호출됨 : ' + id + ', ' + password);
  UserModel.findById(id, function(err, results) {
      if (err) {
          callback(err, null);
          return;
      }
      console.log('아이디 %s로 검색한 결과');
      if (results.length > 0) {
          if (results[0]._doc.password === password) {
              console.log('비밀번호 일치함');
              callback(null, results);
          } else {
              console.log('비밀번호 일치하지 않음');
              callback(null, null);
          }
      } else {
          console.log('아이디 일치하는 사용자 없음');
          callback(null, null);
      }
  });
};


//사용자 추가
var addUser = function(db, id, password, name, name1, name2, name3, name4, callback) {
  console.log('picture 호출됨 : ' + id + ', ' + password + ', ' + name
  + ', ' + name1 + ', ' + name2 + ', ' + name3 + ', ' + name4);

 var user = new UserModel({"id":id, "password":password, "name":name,
 "bikename":name1, "bikenumber":name2, "bikebrand":name3, "gps":name4});

 user.save(function(err) {
  if (err) {
    callback(err, null);
    return;
  }
  console.log('사용자 데이터 추가함');
  callback(null, user);
 });
};


//사용자 리스트 출력
router.route('/process/listuser').post(function(req, res)
{
  console.log('/process/listuser 라우팅 함수 호출됨');
  if(db)
  {
    UserModel.findAll(function(err, results)
    {
      if (err)
      {
      console.log('에러 발생');
      res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
      res.write('<h1>에러발생</h1>');
      res.write('<br><br><a href="/login">돌아가기</a>' );
      res.end();
      return;
      }

      if(results)
      {
        console.dir(results);
        res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
        res.write("<h3>사용자 리스트</h3>");
        res.write("<div><ul>");

        for ( var i = 0; i <results.length; i++)
        {
          var curId = results[i]._doc.id;
          var curName = results[i]._doc.name;
          res.write("  <li>#" + i + " -> " + curId + ", " + curName + "</li>" );
        }
        res.write("</ul></div>");
        res.write('<br><br><a href="/main">돌아가기</a>' );
        res.end();
        }
        else
        {
          if (err)
          {
            console.log('에러 발생');
            res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
            res.write('<h1>조회된 사용자 없음</h1>');
            res.end();
          }
        }
      });
  }else
  {
    console.log('에러 발생');
    res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
    res.write('<h1>데이터베이스 연결 안됨</h1>');
    res.end();
  }
});


//라우터 연결
const login = require('./router/login/login');
const picture = require('./router/picture/picture');
const listuser = require('./router/listuser/listuser');
const lock = require('./router/lock/lock');
const main = require('./router/main/main');
const gps_tracker = require('./router/gps/gps_tracker');
//const error = require('./router/error/error');


//라우터 실행
app.use('/', router);
app.use('/login', login);
app.use('/picture', picture);
app.use('/listuser', listuser);
app.use('/lock', lock);
app.use('/main', main);
app.use('/gps', gps_tracker);


//웹 서버 실행
app.set('port', process.env.PORT || 3000);
var server = http.createServer(app).listen(app.get('port') , function(){
  console.log('express web sever start : ' + app.get('port'));
  //데이터베이스 연결
  connectDB();
}); 
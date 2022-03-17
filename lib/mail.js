
var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var path = require('path');
var mailSender = require('./module/mailSender.js');
var cookie = require('cookie');
var templete = require('./templete.js');

var authNum = '';
function makeAuthNum(){
    authNum = Math.floor((Math.random()*900000)+100000);
}

exports.mail = function(request, response){//이메일 입력 받음.
  var _url = request.url;// /seat?id=AW756
  var queryData = url.parse(_url, true).query;// {id: AW756}
  var filteredID = path.parse(queryData.id).base; //AW756
  fs.readdir('./data', function(err, fileList){
    var body = `
    <!doctype html>
    <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      <strong>메일 인증</strong>
      <form action="/mail2?id=${filteredID}" method="post">
        <table class='table1'>
          <tr>
            <td>
              <input type='text' name='email' id='email'>
            </td>
            <td>
              <button type='submit'>인증하기</button>
            </td>
          </tr>
        </table>
      </form>
    </body>
  `
    var list = templete.List(fileList);
    var html = templete.HTML(list, body);

    response.writeHead(200);//200 : 파일을 성공적으로 전송했다는 의미
    response.end(html);
  })
}

exports.mail2 = function(request, response){//이메일로 인증코드 생성 후 전송
  var _url = request.url;// /seat?id=AW756
  var queryData = url.parse(_url, true).query;// {id: AW756}
  var filteredID = path.parse(queryData.id).base; //AW756
  fs.readdir('./data', function(err, fileList){
    var body = '';
    request.on('data', function(data){
      body = body + data;
      console.log(body);
    });
    request.on('end', function(){
      var post = qs.parse(body);
      console.log(post);

      makeAuthNum();
      console.log("1:"+authNum);
      var mailSubject = `Flimate 인증번호`;
      var mailText = `
      Flimate의 메일 인증번호가 도착했습니다.

      인증번호 : ${authNum}
      `
      mailSender.sendGmail(post.email, mailSubject, mailText);

      var body2 = `
      <!doctype html>
      <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <strong>인증코드 입력</strong>
        <form action="/mail3?id=${filteredID}" method="post">
        <table class='table1'>
          <tr>
            <td>
              <input type='text' name='auth' id='auth'>
            </td>
            <td>
              <button type='submit'>확인</button>
              <input type='hidden' name='umail' value=${post.email}>
            </td>
          </tr>
        </table>

        </form>
      </body>
    `;
    var list = templete.List(fileList);
    var html = templete.HTML(list, body2);

    response.writeHead(200);//200 : 파일을 성공적으로 전송했다는 의미
    response.end(html);

    })
  })
}

exports.mail3 = function(request, response){//인증코드 비교
  var _url = request.url;// /seat?id=AW756
  var queryData = url.parse(_url, true).query;// {id: AW756}
  var filteredID = path.parse(queryData.id).base; //AW756
  var body = '';
  request.on('data', function(data){
    body = body + data;
  });
  request.on('end', function(){
    var post = qs.parse(body);//사용자가 입력한 인증번호(post.auth), 사용자 이메일(post.email) 데이터를 가지고 있음.
    // console.log(post.auth+typeof(post.auth));
    // console.log(num+typeof(num));
    console.log(post);
    if(post.auth === (authNum+'')){
      console.log("goood");
      response.writeHead(302, {
       'Set-Cookie':[`umail=${post.umail}`],
        Location: `/seat?id=${filteredID}`});
      response.end();

    }
    else{
      console.log("BADDD try agin");
      response.writeHead(302, {Location:`/mail?id=${filteredID}`});

      response.end();
    }

  })
}

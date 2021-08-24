const apiRouter = require("express").Router();
const modernizr = require("modernizr"); //mobile checking

function mobileChecking() {
  if(modernizr.touchevents) {
    return true;
  } else {
    return false;
  }
}

//school 인스턴스 생성  
const School = require('school-kr')
const school = new School()

//청심국제고등학교로 학교 초기화 
school.init(School.Type.HIGH, School.Region.GYEONGGI, 'J100005286')

apiRouter.get('/keyboard', function(req, res) {
  const data = {'type' : 'text'}
  res.json(data);  
});

//월간 급식 챗봇 코드 
apiRouter.post('/monthlymeal', async function(req,res) {
  const preMap = req.body.action.detailParams;
  const monthlydate = JSON.stringify(preMap);
  // const monthlymeal_result = monthlydate.substring(30,32); for params 
  if(mobileChecking) {
    var monthlymeal_result = monthlydate.substring(42,44); //40,42
  } else {
    var monthlymeal_result = monthlydate.substring(34,36);
  }
  
  // 01~09 를 1~9로 치환해주는 작업 
  if(monthlymeal_result.charAt(0) == '0') {
    var monthlymeal_result2 = monthlymeal_result.substring(1);
  } else {
    var monthlymeal_result2 = monthlymeal_result;
  };

  const meal2 = await school.getMeal({default: '이 날은 급식이 없습니다.'});
  const monthly_printing = meal2[monthlymeal_result2];

  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: `${meal2.month}월 ${monthlymeal_result2}일 급식정보 \n` + monthly_printing
          }
        }
      ] 
    }
  };
  res.json(responseBody)
});

//내일 급식 챗봇 코드
apiRouter.post('/tomorrowmeal', async function(req,res) {
  //오늘 날짜 & 내일 날짜
  var todaydate = new Date();
  var tomorrowdate = new Date(todaydate.setDate(todaydate.getDate() + 1));
  
  const meal3 = await school.getMeal({year: 2021, month: tomorrowdate.getMonth(), default: '이 날은 급식이 없습니다.'})
  const tomorrow_printing = meal3[tomorrowdate.getDate()];

  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: `${meal3.month}월 ${tomorrowdate.getDate()}일 급식정보 \n` + tomorrow_printing
          }
        }
      ]
    }
  };
  res.json(responseBody);
});

//오늘 급식 챗봇 코드
apiRouter.post('/todaymeal', async function(req,res) {
  const meal4 = await school.getMeal({default: '이 날은 급식이 없습니다.'});
  const today_printing = meal4[meal4.day];

  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: `${meal4.month}월 ${meal4.day}일 급식정보 \n` + today_printing
          }
        }
      ] 
    }
  };
  res.json(responseBody)
});


module.exports = apiRouter;
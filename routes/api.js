const apiRouter = require("express").Router();
const modernizr = require("modernizr"); //mobile checking

function mobileChecking() {
  if(modernizr.touchevents) {
    return true;
  } else {
    return false;
  }
}

const School = require('school-kr')
const school = new School()

school.init(School.Type.HIGH, School.Region.GYEONGGI, 'J100005286')

apiRouter.get('/keyboard', function(req, res) {
  const data = {'type' : 'text'}
  res.json(data);  
});


apiRouter.post('/monthlymeal', async function(req,res) {
  const preMap = req.body.action.detailParams;
  const monthlydate = JSON.stringify(preMap);
  // const monthlymeal_result = monthlydate.substring(30,32); for params 
  if(mobileChecking) {
    var monthlymeal_result = monthlydate.substring(14,16);
  } else {
    var monthlymeal_result = monthlydate.substring(30,32);
  }
  

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

apiRouter.post('/tomorrowmeal', async function(req,res) {
  const meal3 = await school.getMeal({default: '이 날은 급식이 없습니다.'});
  const tomorrow_number = Number(meal3.day) + 1;
  const tomorrow_string = String(tomorrow_number);
  const tomorrow_printing = meal3[tomorrow_string];

  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: `${meal3.month}월 ${tomorrow_string}일 급식정보 \n` + tomorrow_printing
          }
        }
      ] 
    }
  };
  res.json(responseBody)
});
module.exports = apiRouter;
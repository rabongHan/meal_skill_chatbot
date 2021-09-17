const apiRouter = require("express").Router();
const modernizr = require("modernizr"); //mobile checking
const mysql = require('mysql'); //mysql
// for db 
const connection_sql = mysql.createConnection({
  host : 'us-cdbr-east-04.cleardb.com',
  user : 'bd5b40975a7ae8',
  password : '63ebf715',
  database : 'heroku_e881962895583c8'
});
// 

//mobile checking function
function mobileChecking() {
  if(modernizr.touchevents) {
    return true;
  } else {
    return false;
  }
}

//school 인스턴스 생성  
const School = require('school-kr');
const { connection, set, ConnectionStates } = require("mongoose");
const { query } = require("express");
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
  
  const meal3 = await school.getMeal({year: 2021, month: tomorrowdate.getMonth() + 1, default: '이 날은 급식이 없습니다.'})
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


//학번 등록 챗봇 코드
apiRouter.post('/addStudentNum', async function(req,res) {
  const userId = req.body.userRequest.user.id; //kakao 식별자
  const temp = req.body.action.params; //params로 학번 담긴 params 전부 받아옴 {"number":"{\"amount\": 30324, \"unit\": null}"}
  const temp2 = JSON.stringify(temp); //[object object] --> string
  
  //mobilechecking
  if(mobileChecking) {
    var userStudentNum = temp2.substring(23,29);
  } else {
    var userStudentNum = temp2.substring(23,29);
  };
  
  async function getInfo() {
    var output = await getYes("SELECT * FROM Board WHERE username='${userId}' LIMIT 1) AS SUCCESS");
    return output;
  }
  
  function getYes(databaseQuery) {
    return new Promise(data => {
      connection_sql.query(databaseQuery, function(error, result) {
        if(error)  {
          console.log(error);
          throw error;
        }
        data(result);
      });
    });
  }


  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            description: `${JSON.stringify(await getInfo())}`
          }
        }
      ] 
    }
  };
  res.json(responseBody)
});

// 학번 등록수정 블록 call 챗봇 코드
apiRouter.post('/calladding', async function(req,res) {
  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "아래 버튼을 눌러 학번을 등록하거나 수정해주세요"
          }
        }
      ],
      quickReplies: [
        {
          action: "block",
          label: "학번 등록",
          blockId: "6124baf3c67cf70587a192c7"
        },
        {
          action: "block",
          label: "학번 수정",
          blockId: "6125e0b679c93c12d248f78b"
        }
      ] 
    }
  };
  res.json(responseBody)
});

// 학번 수정 챗봇 코드
apiRouter.post('/changeStudentNum', async function(req,res) {
  const userId = req.body.userRequest.user.id; //kakao 식별자
  const temp_2 = req.body.action.params; //params로 학번 담긴 params 전부 받아옴
  const temp_2_2 = JSON.stringify(temp_2); //[object object] --> string
  
  //mobilechecking
  if(mobileChecking) {
    var userStudentNum_revised = temp_2_2.substring(23,29);
  } else {
    var userStudentNum_revised = temp_2_2.substring(23,29);
  }
  
  const checking = await database.query(`SELECT COUNT(*) FROM board WHERE username = '$userId'`);
  //학번이 등록 안된 경우
  if(checking == 0) {
    var extra_text = "학번이 등록되지 않았습니다."
  } else {
      await database.query(`
        UPDATE board SET studentId='$userStudentNum_revised' WHERE username='$userId'
      `)
      var extra_text = `${userStudentNum_revised} 학번으로 수정되었습니다.`  
  }
  // if(!userDB[userId]) {
  //   var extra_text = "학번이 등록되지 않았습니다."
  // } else if(userDB[userId] == userStudentNum_revised) { //수정하려는 학번과 기존 학번이 같은 경우 
  //   var extra_text = "등록된 학번과 같은 학번입니다."
  // } else {
  //   userDB[userId] = userStudentNum_revised;
  //   var extra_text = `${userStudentNum_revised} 학번으로 수정되었습니다.`
  // }

  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            description: extra_text
          }
        }
      ] 
    }
  };
  res.json(responseBody)
});

// 시간표 챗봇 코드 
apiRouter.post('/studenttimetable', async function(req,res) {
  const userId = req.body.userRequest.user.id; //kakao 식별자
  const todaydate2 = new Date();
  const today_day_2 = todaydate2.getDay(); //0~6 > 일~토 ; 0:일 / 1:월 / 2:화 / 3:수 / 4:목 / 5:금 / 6:토
  const arrDayStr = ['일','월','화','수','목','금','토'];

  //시간표 딕셔너리 
  const student_timetable = { 
    " 11" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "통합과학", "3교시" : "국어(조영현)", "4교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "5교시" : "수학(국제/국내)", "6교시" : "태권도", "7교시" : "통합사회", "8교시": "국어(이도윤)"},
      "2": {"1교시" : "창체봉사", "2교시" : "제2외국어", "3교시" : "영어", "4교시" : "영어", "5교시" : "과학탐구실험(김유석)", "6교시" : "조정", "7교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "8교시": "수학(국제/국내)"},
      "3": {"1교시" : "창체동아리", "2교시" : "음악연주", "3교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "4교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "5교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "6교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "7교시" : "제2외국어", "8교시": "과학탐구실험(이근정)"},
      "4": {"1교시" : "보건", "2교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "3교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "4교시" : "제2외국어", "5교시" : "통합사회", "6교시" : "국어(이도윤)", "7교시" : "수학(국제/국내)", "8교시": "공강"},
      "5": {"1교시" : "진로", "2교시" : "국어(조영현)", "3교시" : "수학(국제/국내)", "4교시" : "통합사회", "5교시" : "통합과학", "6교시" : "영어"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 12" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "영어", "3교시" : "영어", "4교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "5교시" : "수학(국제/국내)", "6교시" : "태권도", "7교시" : "국어(조영현)", "8교시": "통합과학"},
      "2": {"1교시" : "창체봉사", "2교시" : "제2외국어", "3교시" : "국어(이도윤)", "4교시" : "통합사회", "5교시" : "조정", "6교시" : "과학탐구실험(김유석)", "7교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "8교시": "수학(국제/국내)"},
      "3": {"1교시" : "창체동아리", "2교시" : "과학탐구실험(이근정)", "3교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "4교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "5교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "6교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "7교시" : "제2외국어", "8교시": "통합사회"},
      "4": {"1교시" : "보건", "2교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "3교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "4교시" : "제2외국어", "5교시" : "영어", "6교시" : "국어(조영현)", "7교시" : "수학(국제/국내)", "8교시": "공강"},
      "5": {"1교시" : "진로", "2교시" : "국어(이도윤)", "3교시" : "수학(국제/국내)", "4교시" : "음악연주", "5교시" : "통합사회", "6교시" : "통합과학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 13" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "통합사회", "3교시" : "국어(이도윤)", "4교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "5교시" : "태권도", "6교시" : "수학(국제/국내)", "7교시" : "영어", "8교시": "영어"},
      "2": {"1교시" : "창체봉사", "2교시" : "제2외국어", "3교시" : "과학탐구실험(김유석)", "4교시" : "조정", "5교시" : "통합과학", "6교시" : "국어(조영현)", "7교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "8교시": "통합사회"},
      "3": {"1교시" : "창체동아리", "2교시" : "영어", "3교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "4교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "5교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "6교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "7교시" : "제2외국어", "8교시": "수학(국제/국내)"},
      "4": {"1교시" : "보건", "2교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "3교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "4교시" : "제2외국어", "5교시" : "과학탐구실험", "6교시" : "수학(국제/국내)", "7교시" : "국어(조영현)", "8교시": "공강"},
      "5": {"1교시" : "진로", "2교시" : "통합사회", "3교시" : "통합과학", "4교시" : "수학(국제/국내)", "5교시" : "음악연주", "6교시" : "국어(이도윤)"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 14" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "국어", "3교시" : "통합과학", "4교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "5교시" : "태권도", "6교시" : "수학(국제/국내)", "7교시" : "국어(이도윤)", "8교시": "통합사회"},
      "2": {"1교시" : "창체봉사", "2교시" : "제2외국어", "3교시" : "조정", "4교시" : "과학탐구실험(김유석)", "5교시" : "영어", "6교시" : "영어", "7교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "8교시": "과학탐구실험(이근정)"},
      "3": {"1교시" : "창체동아리", "2교시" : "통합사회", "3교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "4교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "5교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "6교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "7교시" : "제2외국어", "8교시": "수학(국제/국내)"},
      "4": {"1교시" : "보건", "2교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "3교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "4교시" : "제2외국어", "5교시" : "국어(조영현)", "6교시" : "수학(국제/국내)", "7교시" : "국어(이도윤)", "8교시": "공강"},
      "5": {"1교시" : "진로", "2교시" : "통합과학", "3교시" : "음악연주", "4교시" : "수학(국제/국내)", "5교시" : "영어", "6교시" : "통합사회"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 21" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "수학II/미적분", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "응용 영문법", "6교시" : "응용 영문법", "7교시" : "진로", "8교시": "한국사"},
      "2": {"1교시" : "창체봉사", "2교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "3교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "4교시" : "수학II/미적분", "5교시" : "문학", "6교시" : "문학", "7교시" : "미술창작", "8교시": "제2외국어"},
      "3": {"1교시" : "창체동아리", "2교시" : "제2외국어", "3교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "4교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "5교시" : "응용 영문법", "6교시" : "응용 영문법", "7교시" : "한국사", "8교시": "공강"},
      "4": {"1교시" : "독서", "2교시" : "제2외국어", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "수학II/미적분", "6교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "7교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "스포츠생활", "3교시" : "문학", "4교시" : "수학II/미적분", "5교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "6교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 22" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "수학II/미적분", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "문학", "6교시" : "문학", "7교시" : "한국사", "8교시": "진로"},
      "2": {"1교시" : "창체봉사", "2교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "3교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "4교시" : "수학II/미적분", "5교시" : "미술창작", "6교시" : "응용 영문법", "7교시" : "응용 영문법", "8교시": "제2외국어"},
      "3": {"1교시" : "창체동아리", "2교시" : "제2외국어", "3교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "4교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "5교시" : "스포츠생활", "6교시" : "한국사", "7교시" : "문학", "8교시": "공강"},
      "4": {"1교시" : "독서", "2교시" : "제2외국어", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "수학II/미적분", "6교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "7교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "응용 영문법", "3교시" : "응용 영문법", "4교시" : "수학II/미적분", "5교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "6교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 23" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "영어 작문과 토론", "6교시" : "영어 작문과 토론", "7교시" : "미술창작", "8교시": "영어 비평적 읽기와 쓰기/AP영어학II"},
      "2": {"1교시" : "창체봉사", "2교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "3교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "4교시" : "AP미적분BC - I", "5교시" : "AP미적분BC - I", "6교시" : "한국사", "7교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "8교시": "제2외국어"},
      "3": {"1교시" : "창체동아리", "2교시" : "제2외국어", "3교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "4교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "5교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "6교시" : "영어 작문과 토론", "7교시" : "AP미적분BC - I", "8교시": "스포츠생활"},
      "4": {"1교시" : "진로", "2교시" : "제2외국어", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "6교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "7교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "한국사", "3교시" : "AP미적분BC - I", "4교시" : "영어 작문과 토론", "5교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "6교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 24" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "스포츠생활", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "미술창작", "6교시" : "AP미적분BC - I", "7교시" : "AP미적분BC - I", "8교시": "영어 비평적 읽기와 쓰기/AP영어학II"},
      "2": {"1교시" : "창체봉사", "2교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "3교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "4교시" : "한국사", "5교시" : "영어 작문과 토론", "6교시" : "영어 작문과 토론", "7교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "8교시": "제2외국어"},
      "3": {"1교시" : "창체동아리", "2교시" : "제2외국어", "3교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "4교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "5교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "6교시" : "AP미적분BC - I", "7교시" : "영어 작문과 토론", "8교시": "한국사"},
      "4": {"1교시" : "진로", "2교시" : "제2외국어", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "6교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "7교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "AP미적분BC - I", "3교시" : "영어 작문과 토론", "4교시" : "한국사", "5교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "6교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 31" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "심화 영어II", "4교시" : "수학 과제탐구", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "7교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "8교시": "공강"},
      "2": {"1교시" : "창체봉사", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "4교시" : "심화 영어II", "5교시" : "독서논술", "6교시" : "진로", "7교시" : "공강", "8교시": "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리"},
      "3": {"1교시" : "창체동아리", "2교시" : "독서논술", "3교시" : "독서논술", "4교시" : "운동과 건강", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "7교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "8교시": "공강"},
      "4": {"1교시" : "", "2교시" : "심화 영어II", "3교시" : "심화 영어II", "4교시" : "독서논술", "5교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "6교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "7교시" : "운동과 건강", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "3교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "4교시" : "수학 과제탐구", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 32" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "수학 과제탐구", "4교시" : "심화 영어II", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "7교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "8교시": "공강"},
      "2": {"1교시" : "창체봉사", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "4교시" : "독서논술", "5교시" : "심화 영어II", "6교시" : "공강", "7교시" : "진로", "8교시": "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리"},
      "3": {"1교시" : "창체동아리", "2교시" : "심화 영어II", "3교시" : "심화 영어II", "4교시" : "운동과 건강", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "7교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "8교시": "공강"},
      "4": {"1교시" : "", "2교시" : "독서논술", "3교시" : "독서논술", "4교시" : "수학 과제탐구", "5교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "6교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "7교시" : "운동과 건강", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "3교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "4교시" : "독서논술", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 33" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "독서논술", "4교시" : "심화영어작문II/심화영어독해II", "5교시" : "수학 과제연구", "6교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "7교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "8교시": "공강 / 선형대수학[주문형]"},
      "2": {"1교시" : "창체봉사", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "4교시" : "통합논술", "5교시" : "진로", "6교시" : "심화영어작문II/심화영어독해II", "7교시" : "공강 / 선형대수학[주문형]", "8교시": "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리"},
      "3": {"1교시" : "창체동아리", "2교시" : "독서논술", "3교시" : "운동과 건강", "4교시" : "심화영어작문II/심화영어독해II", "5교시" : "수학 과제연구", "6교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "7교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "8교시": "공강 / 선형대수학[주문형]"},
      "4": {"1교시" : "공강 / 선형대수학[주문형]", "2교시" : "통합논술", "3교시" : "통합논술", "4교시" : "운동과 건강", "5교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "6교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "7교시" : "심화영어작문II/심화영어독해I", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "3교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "4교시" : "통합논술", "5교시" : "독서논술", "6교시" : "독서논술"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 34" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "수학 과제연구", "4교시" : "심화영어작문II/심화영어독해II", "5교시" : "독서 논술", "6교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "7교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "8교시": "공강 / 선형대수학[주문형]"},
      "2": {"1교시" : "창체봉사", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "4교시" : "통합논술", "5교시" : "진로", "6교시" : "심화영어작문II/심화영어독해II", "7교시" : "공강 / 선형대수학[주문형]", "8교시": "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리"},
      "3": {"1교시" : "창체동아리", "2교시" : "수학 과제연구", "3교시" : "운동과 건강", "4교시" : "심화영어작문II/심화영어독해II", "5교시" : "독서논술", "6교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "7교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "8교시": "공강 / 선형대수학[주문형]"},
      "4": {"1교시" : "공강 / 선형대수학[주문형]", "2교시" : "통합논술", "3교시" : "통합논술", "4교시" : "운동과 건강", "5교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "6교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "7교시" : "심화영어작문II/심화영어독해I", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "3교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "4교시" : "통합논술", "5교시" : "독서논술", "6교시" : "독서논술"},
      "6": "오늘은 수업이 없습니다", 
    },
  };

  //시간표 상 key(=존재 학년)과 학번이 일치하는지, 즉 있는 학년인지 판단  
  if(!userDB[userId]) {
    var timetable_printing_final = "먼저 학번을 등록해주세요."
  } else if(userDB[userId].substring(0,2) + userDB[userId].substring(3,4) in student_timetable) {
    const temp_student_num = userDB[userId];
    const cut_student_num = temp_student_num.substring(0,2) + temp_student_num.substring(3,4); // 30324 --> " 33"
    const timetable_printing_1 = JSON.stringify(student_timetable[cut_student_num][today_day_2]);
    const timetable_printing_2 = timetable_printing_1.replace(/\"/gi, "");
    const timetable_printing_3 = timetable_printing_2.replace("{", "");
    const timetable_printing_4 = timetable_printing_3.replace("}", "");
    const timetable_printing_5 = timetable_printing_4.replace(/:/gi, ": ");
    var timetable_printing_final = `${arrDayStr[today_day_2]}요일 ${temp_student_num.substring(0,2)}학년 ${temp_student_num.substring(3,4)}반 시간표\n` + timetable_printing_5.replace(/,/gi, "\n");
  } else {
    const temp_student_num = userDB[userId];
    const cut_student_num = temp_student_num.substring(0,2) + temp_student_num.substring(3,4); // 30324 --> " 33"
    var timetable_printing_final = `현재 등록 학번: ${temp_student_num} \n이 학번에 해당하는 시간표를 찾을 수 없습니다.`
  }



  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: timetable_printing_final
          }
        }
      ] 
    }
  };
  res.json(responseBody)
});

// 내일 시간표 챗봇 코드 
apiRouter.post('/studenttimetable_tomorrow', async function(req,res) {
  const userId = req.body.userRequest.user.id; //kakao 식별자
  var todaydate = new Date();
  const tomorrowdate3 = new Date(todaydate.setDate(todaydate.getDate() + 1));
  const tomorrow_day_3 = tomorrowdate3.getDay(); //0~6 > 일~토 ; 0:일 / 1:월 / 2:화 / 3:수 / 4:목 / 5:금 / 6:토
  const arrDayStr = ['일','월','화','수','목','금','토'];

  //시간표 딕셔너리 
  const student_timetable = { 
    " 11" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "통합과학", "3교시" : "국어(조영현)", "4교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "5교시" : "수학(국제/국내)", "6교시" : "태권도", "7교시" : "통합사회", "8교시": "국어(이도윤)"},
      "2": {"1교시" : "창체봉사", "2교시" : "제2외국어", "3교시" : "영어", "4교시" : "영어", "5교시" : "과학탐구실험(김유석)", "6교시" : "조정", "7교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "8교시": "수학(국제/국내)"},
      "3": {"1교시" : "창체동아리", "2교시" : "음악연주", "3교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "4교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "5교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "6교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "7교시" : "제2외국어", "8교시": "과학탐구실험(이근정)"},
      "4": {"1교시" : "보건", "2교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "3교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "4교시" : "제2외국어", "5교시" : "통합사회", "6교시" : "국어(이도윤)", "7교시" : "수학(국제/국내)", "8교시": "공강"},
      "5": {"1교시" : "진로", "2교시" : "국어(조영현)", "3교시" : "수학(국제/국내)", "4교시" : "통합사회", "5교시" : "통합과학", "6교시" : "영어"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 12" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "영어", "3교시" : "영어", "4교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "5교시" : "수학(국제/국내)", "6교시" : "태권도", "7교시" : "국어(조영현)", "8교시": "통합과학"},
      "2": {"1교시" : "창체봉사", "2교시" : "제2외국어", "3교시" : "국어(이도윤)", "4교시" : "통합사회", "5교시" : "조정", "6교시" : "과학탐구실험(김유석)", "7교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "8교시": "수학(국제/국내)"},
      "3": {"1교시" : "창체동아리", "2교시" : "과학탐구실험(이근정)", "3교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "4교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "5교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "6교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "7교시" : "제2외국어", "8교시": "통합사회"},
      "4": {"1교시" : "보건", "2교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "3교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "4교시" : "제2외국어", "5교시" : "영어", "6교시" : "국어(조영현)", "7교시" : "수학(국제/국내)", "8교시": "공강"},
      "5": {"1교시" : "진로", "2교시" : "국어(이도윤)", "3교시" : "수학(국제/국내)", "4교시" : "음악연주", "5교시" : "통합사회", "6교시" : "통합과학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 13" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "통합사회", "3교시" : "국어(이도윤)", "4교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "5교시" : "태권도", "6교시" : "수학(국제/국내)", "7교시" : "영어", "8교시": "영어"},
      "2": {"1교시" : "창체봉사", "2교시" : "제2외국어", "3교시" : "과학탐구실험(김유석)", "4교시" : "조정", "5교시" : "통합과학", "6교시" : "국어(조영현)", "7교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "8교시": "통합사회"},
      "3": {"1교시" : "창체동아리", "2교시" : "영어", "3교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "4교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "5교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "6교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "7교시" : "제2외국어", "8교시": "수학(국제/국내)"},
      "4": {"1교시" : "보건", "2교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "3교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "4교시" : "제2외국어", "5교시" : "과학탐구실험", "6교시" : "수학(국제/국내)", "7교시" : "국어(조영현)", "8교시": "공강"},
      "5": {"1교시" : "진로", "2교시" : "통합사회", "3교시" : "통합과학", "4교시" : "수학(국제/국내)", "5교시" : "음악연주", "6교시" : "국어(이도윤)"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 14" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "국어", "3교시" : "통합과학", "4교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "5교시" : "태권도", "6교시" : "수학(국제/국내)", "7교시" : "국어(이도윤)", "8교시": "통합사회"},
      "2": {"1교시" : "창체봉사", "2교시" : "제2외국어", "3교시" : "조정", "4교시" : "과학탐구실험(김유석)", "5교시" : "영어", "6교시" : "영어", "7교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "8교시": "과학탐구실험(이근정)"},
      "3": {"1교시" : "창체동아리", "2교시" : "통합사회", "3교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "4교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "5교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "6교시" : "생명과학/화학/지구과학/AP일반화학/AP일반물리/AP일반생물학", "7교시" : "제2외국어", "8교시": "수학(국제/국내)"},
      "4": {"1교시" : "보건", "2교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "3교시" : "경제/사회문화/거시경제/AP미국정치/AP세계사", "4교시" : "제2외국어", "5교시" : "국어(조영현)", "6교시" : "수학(국제/국내)", "7교시" : "국어(이도윤)", "8교시": "공강"},
      "5": {"1교시" : "진로", "2교시" : "통합과학", "3교시" : "음악연주", "4교시" : "수학(국제/국내)", "5교시" : "영어", "6교시" : "통합사회"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 21" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "수학II/미적분", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "응용 영문법", "6교시" : "응용 영문법", "7교시" : "진로", "8교시": "한국사"},
      "2": {"1교시" : "창체봉사", "2교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "3교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "4교시" : "수학II/미적분", "5교시" : "문학", "6교시" : "문학", "7교시" : "미술창작", "8교시": "제2외국어"},
      "3": {"1교시" : "창체동아리", "2교시" : "제2외국어", "3교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "4교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "5교시" : "응용 영문법", "6교시" : "응용 영문법", "7교시" : "한국사", "8교시": "공강"},
      "4": {"1교시" : "독서", "2교시" : "제2외국어", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "수학II/미적분", "6교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "7교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "스포츠생활", "3교시" : "문학", "4교시" : "수학II/미적분", "5교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "6교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 22" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "수학II/미적분", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "문학", "6교시" : "문학", "7교시" : "한국사", "8교시": "진로"},
      "2": {"1교시" : "창체봉사", "2교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "3교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "4교시" : "수학II/미적분", "5교시" : "미술창작", "6교시" : "응용 영문법", "7교시" : "응용 영문법", "8교시": "제2외국어"},
      "3": {"1교시" : "창체동아리", "2교시" : "제2외국어", "3교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "4교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "5교시" : "스포츠생활", "6교시" : "한국사", "7교시" : "문학", "8교시": "공강"},
      "4": {"1교시" : "독서", "2교시" : "제2외국어", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "수학II/미적분", "6교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "7교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "응용 영문법", "3교시" : "응용 영문법", "4교시" : "수학II/미적분", "5교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "6교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 23" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "영어 작문과 토론", "6교시" : "영어 작문과 토론", "7교시" : "미술창작", "8교시": "영어 비평적 읽기와 쓰기/AP영어학II"},
      "2": {"1교시" : "창체봉사", "2교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "3교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "4교시" : "AP미적분BC - I", "5교시" : "AP미적분BC - I", "6교시" : "한국사", "7교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "8교시": "제2외국어"},
      "3": {"1교시" : "창체동아리", "2교시" : "제2외국어", "3교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "4교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "5교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "6교시" : "영어 작문과 토론", "7교시" : "AP미적분BC - I", "8교시": "스포츠생활"},
      "4": {"1교시" : "진로", "2교시" : "제2외국어", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "6교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "7교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "한국사", "3교시" : "AP미적분BC - I", "4교시" : "영어 작문과 토론", "5교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "6교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 24" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "스포츠생활", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "미술창작", "6교시" : "AP미적분BC - I", "7교시" : "AP미적분BC - I", "8교시": "영어 비평적 읽기와 쓰기/AP영어학II"},
      "2": {"1교시" : "창체봉사", "2교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "3교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "4교시" : "한국사", "5교시" : "영어 작문과 토론", "6교시" : "영어 작문과 토론", "7교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "8교시": "제2외국어"},
      "3": {"1교시" : "창체동아리", "2교시" : "제2외국어", "3교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "4교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "5교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "6교시" : "AP미적분BC - I", "7교시" : "영어 작문과 토론", "8교시": "한국사"},
      "4": {"1교시" : "진로", "2교시" : "제2외국어", "3교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "4교시" : "물리학II/화학II/실전윤리학의 이해/국제경제/AP생물학II/AP일반물리II/AP일반화학II/AP미국사", "5교시" : "영어 비평적 읽기와 쓰기/AP영어학II", "6교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "7교시" : "사회탐구방법/생태와 환경/정치학 고전읽기/사회학 개론/AP물리학C/논증적 글쓰기", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "AP미적분BC - I", "3교시" : "영어 작문과 토론", "4교시" : "한국사", "5교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학", "6교시" : "비교문화/국제법/통계로 바라보는 국제문제/AP미국정치/거시경제학/AP통계학"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 31" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "심화 영어II", "4교시" : "수학 과제탐구", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "7교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "8교시": "공강"},
      "2": {"1교시" : "창체봉사", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "4교시" : "심화 영어II", "5교시" : "독서논술", "6교시" : "진로", "7교시" : "공강", "8교시": "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리"},
      "3": {"1교시" : "창체동아리", "2교시" : "독서논술", "3교시" : "독서논술", "4교시" : "운동과 건강", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "7교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "8교시": "공강"},
      "4": {"1교시" : "", "2교시" : "심화 영어II", "3교시" : "심화 영어II", "4교시" : "독서논술", "5교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "6교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "7교시" : "운동과 건강", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "3교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "4교시" : "수학 과제탐구", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 32" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "수학 과제탐구", "4교시" : "심화 영어II", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "7교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "8교시": "공강"},
      "2": {"1교시" : "창체봉사", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "4교시" : "독서논술", "5교시" : "심화 영어II", "6교시" : "공강", "7교시" : "진로", "8교시": "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리"},
      "3": {"1교시" : "창체동아리", "2교시" : "심화 영어II", "3교시" : "심화 영어II", "4교시" : "운동과 건강", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "7교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "8교시": "공강"},
      "4": {"1교시" : "", "2교시" : "독서논술", "3교시" : "독서논술", "4교시" : "수학 과제탐구", "5교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "6교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "7교시" : "운동과 건강", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "3교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "4교시" : "독서논술", "5교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해", "6교시" : "중국 언어와 역사의 이해/일본 언어와 역사의 이해"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 33" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "독서논술", "4교시" : "심화영어작문II/심화영어독해II", "5교시" : "수학 과제연구", "6교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "7교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "8교시": "공강 / 선형대수학[주문형]"},
      "2": {"1교시" : "창체봉사", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "4교시" : "통합논술", "5교시" : "진로", "6교시" : "심화영어작문II/심화영어독해II", "7교시" : "공강 / 선형대수학[주문형]", "8교시": "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리"},
      "3": {"1교시" : "창체동아리", "2교시" : "독서논술", "3교시" : "운동과 건강", "4교시" : "심화영어작문II/심화영어독해II", "5교시" : "수학 과제연구", "6교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "7교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "8교시": "공강 / 선형대수학[주문형]"},
      "4": {"1교시" : "공강 / 선형대수학[주문형]", "2교시" : "통합논술", "3교시" : "통합논술", "4교시" : "운동과 건강", "5교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "6교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "7교시" : "심화영어작문II/심화영어독해I", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "3교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "4교시" : "통합논술", "5교시" : "독서논술", "6교시" : "독서논술"},
      "6": "오늘은 수업이 없습니다", 
    },
    " 34" : {
      "0" : "오늘은 수업이 없습니다", 
      "1": {"1교시" : "자율", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "수학 과제연구", "4교시" : "심화영어작문II/심화영어독해II", "5교시" : "독서 논술", "6교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "7교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "8교시": "공강 / 선형대수학[주문형]"},
      "2": {"1교시" : "창체봉사", "2교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "3교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "4교시" : "통합논술", "5교시" : "진로", "6교시" : "심화영어작문II/심화영어독해II", "7교시" : "공강 / 선형대수학[주문형]", "8교시": "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리"},
      "3": {"1교시" : "창체동아리", "2교시" : "수학 과제연구", "3교시" : "운동과 건강", "4교시" : "심화영어작문II/심화영어독해II", "5교시" : "독서논술", "6교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "7교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "8교시": "공강 / 선형대수학[주문형]"},
      "4": {"1교시" : "공강 / 선형대수학[주문형]", "2교시" : "통합논술", "3교시" : "통합논술", "4교시" : "운동과 건강", "5교시" : "사회적경제/윤리와 사상/사회 과제연구/영화소설/AP인문지리", "6교시" : "한국사회의 이해/국제법 과제연구/AP미적분학II/논문작성법/세계문제와 미래사회", "7교시" : "심화영어작문II/심화영어독해I", "8교시": "공강"},
      "5": {"1교시" : "독서", "2교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "3교시" : "현대사회의 윤리적 쟁점/경제학 고전 강독/고급경제학/사회과학방법론/AP화학II/AP물리학/AP생물학", "4교시" : "통합논술", "5교시" : "독서논술", "6교시" : "독서논술"},
      "6": "오늘은 수업이 없습니다", 
    },
  };



  //시간표 상 key(=존재 학년)과 학번이 일치하는지, 즉 있는 학년인지 판단  
  if(!userDB[userId]) {
    var timetable_printing_final2 = "먼저 학번을 등록해주세요."
  } else if(userDB[userId].substring(0,2) + userDB[userId].substring(3,4) in student_timetable) {
    const temp_student_num = userDB[userId];
    const cut_student_num = temp_student_num.substring(0,2) + temp_student_num.substring(3,4); // 30324 --> " 33"
    const timetable_printing_1 = JSON.stringify(student_timetable[cut_student_num][tomorrow_day_3]);
    const timetable_printing_2 = timetable_printing_1.replace(/\"/gi, "");
    const timetable_printing_3 = timetable_printing_2.replace("{", "");
    const timetable_printing_4 = timetable_printing_3.replace("}", "");
    const timetable_printing_5 = timetable_printing_4.replace(/:/gi, ": ");
    var timetable_printing_final2 = `${arrDayStr[tomorrow_day_3]}요일 ${temp_student_num.substring(0,2)}학년 ${temp_student_num.substring(3,4)}반 시간표\n` + timetable_printing_5.replace(/,/gi, "\n");
  } else {
    const temp_student_num = userDB[userId];
    const cut_student_num = temp_student_num.substring(0,2) + temp_student_num.substring(3,4); // 30324 --> " 33"
    var timetable_printing_final2 = `현재 등록 학번: ${temp_student_num} \n이 학번에 해당하는 시간표를 찾을 수 없습니다.`
  }



  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: timetable_printing_final2
          }
        }
      ] 
    }
  };
  res.json(responseBody)
});

//관리자 전용 챗봇 코드
apiRouter.post('/adminJaewon', async function(req,res) {
  const all_users = JSON.stringify(userDB)

  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: all_users
          }
        }
      ] 
    }
  };
  res.json(responseBody)
});

//block ID checking 챗봇 코드
apiRouter.post('/blockId', async function(req,res) {
  const blockId = req.body.userRequest.block.id;

  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: blockId
          }
        }
      ] 
    }
  };
  res.json(responseBody)
});

module.exports = apiRouter;
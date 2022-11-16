const express = require("express");
const cors = require("cors");
const session = require("express-session");

// ========== DB연결 수행 전 라이브러리 호출 ===============
const mysql = require("mysql2");
const { Form } = require("react-router-dom");
const db = mysql.createPoolCluster();
// ========== DB연결 수행 전 라이브러리 호출 ===============

const app = express();
const port = 4000;

app.use(express.json());
app.use(
  session({
    secret: "SECRET",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(
  cors({
    origin: true,
    credentials: true, // 도에인이 달라도 쿠키 공유 받아주는 것
  })
);

db.add("article_project", {
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "article_project",
  port: 3306,
});

/**
 *  비동기를 동기로 바꾸려면
 *  Promise 객체로 묶어줘야함
 */

function 디비실행(query) {
  return new Promise(function (resolve, reject) {
    db.getConnection("article_project", function (error, connection) {
      if (error) {
        console.log("디비 연결 오류", error);
        reject(true);
      }

      connection.query(query, function (error, data) {
        if (error) {
          console.log("쿼리오류", error);
          reject(true);
        }

        resolve(data);
      });
      connection.release();
    });
  });
}

app.get("/", async (req, res) => {
  const 데이터 = await 디비실행("SELECT * FROM user");

  console.log(데이터);

  res.send("여기로 옵니다!!");
});

app.post("/join", async (req, res) => {
  const { id, pw } = req.body;

  const result = {
    code: "success",
    message: "회원가입되었습니다",
  };

  // Mysql user 테이블에 INSERT 해줘야함

  const 회원 = await 디비실행(`SELECT * FROM user WHERE id = '${id}'`);

  if (회원.length > 0) {
    result.code = "error";
    result.message = "이미 같은 아이디로 가입되었습니다";
    res.send(result);
    return;
  }

  const query = `INSERT INTO user(id,password,nickname) VALUES('${id}','${pw}','지나가던나그네')`;
  await 디비실행(query);

  res.send(result);
});

app.get("/user", (req, res) => {
  res.send(req.session.loginUser);
});

app.get("/test", (req, res) => {
  console.log(req.session);

  res.send("//");
});

app.post("/login", async (req, res) => {
  const { id, pw } = req.body;
  /**
   *  1. 아이디랑 비밀번호가 같은 데이터가 있는지 확인 (Mysql DB)
   *   - 같은 데이터가 존재하면 session 저장
   *   - 없을 경우 [회원 정보가 존재하지 않습니다] 메시지 보내주기
   */

  const result = {
    code: "success",
    message: "로그인 되었습니다",
  };

  const 회원 = await 디비실행(
    `SELECT * FROM user WHERE id = '${id}' AND password = '${pw}'`
  );

  if (회원.length === 0) {
    result.code = "error";
    result.message = "회원 정보가 존재하지 않습니다.";
    res.send(result);
    return;
  }

  req.session.loginUser = 회원[0];
  req.session.save();

  res.send(result);
});

app.get("/article_row", async (req, res) => {
  const { seq } = req.query;

  const query = `SELECT * FROM article WHERE seq = '${seq}'`;

  const reply_query = `SELECT * FROM reply WHERE article_seq = '${seq}'`;

  const article = await 디비실행(query);
  const reply = await 디비실행(reply_query);

  res.send({
    article: article[0],
    reply: reply,
  });
});

app.get("/article", async (req, res) => {
  const query = `SELECT * FROM article , user WHERE article.user_seq = user.seq`;

  const article = await 디비실행(query);
  res.send(article);
});

app.post("/article", async (req, res) => {
  const { title, body } = req.body;
  const { loginUser } = req.session;

  const result = {
    code: "success",
    message: "작성되었습니다",
  };

  if (title === "") {
    result.code = "fail";
    result.message = "제목을 작성해주세요";
  }

  if (body === "") {
    result.code = "fail";
    result.message = "내용을 작성해주세요";
  }

  if (result.code === "fail") {
    res.send(result);
    return;
  }

  const query = `INSERT INTO article(title,body,user_seq) VALUES('${title}','${body}','${loginUser.seq}')`;
  await 디비실행(query);
  res.send(result);
});

app.post("/reply", async (req, res) => {
  const { seq, replyText } = req.body;
  const { loginUser } = req.session;

  const result = {
    code: "success",
    message: "댓글이 작성되었습니다",
  };

  if (replyText === "") {
    result.code = "errer";
    result.message = "댓글을 입력해주세요";
  }

  if (result.code === "errer") {
    res.send(result);
    return;
  }

  const query = `INSERT INTO reply(body,article_seq,user_seq) VALUES('${replyText}','${seq}','${loginUser.seq}')`;

  console.log(query);
  await 디비실행(query);

  res.send(result);
});

app.listen(port, () => {
  console.log("서버가 시작되었습니다");
});

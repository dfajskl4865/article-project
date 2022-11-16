import axios from "axios";
import React from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import "./App.css";

// 도에인이 달라도 쿠키 공유해주는 것
axios.defaults.withCredentials = true;

function Write() {
  const navigation = useNavigate();
  const { loginUser } = React.useContext(StoreContext);

  const [data, setData] = React.useState({
    title: "",
    body: "",
  });

  const 데이터변경 = (event) => {
    const name = event.target.name;
    const cloneData = { ...data };
    cloneData[name] = event.target.value;
    setData(cloneData);
  };

  const 작성 = async () => {
    await axios({
      url: "http://localhost:4000/article",
      method: "post",
      data: data,
    })
      .then((response) => {
        if (response.data.code === "success") {
          alert(response.message);
          navigation("/");
        }
      })
      .catch((e) => {
        console.log("Error", e);
      });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 12 }}>
      <h2>게시글작성</h2>
      <h3>제목</h3>
      <input name="title" onChange={데이터변경} />
      <h3>내용</h3>
      <textarea
        name="body"
        onChange={데이터변경}
        cols="50"
        rows="10"
      ></textarea>
      <button type="button" onClick={작성} style={{ marginTop: 12 }}>
        작성하기
      </button>
    </div>
  );
}

function Join() {
  const navigation = useNavigate();

  const [data, setData] = React.useState({
    id: "",
    pw: "",
  });

  const 데이터변경 = (event) => {
    const name = event.target.name;
    const cloneData = { ...data };
    cloneData[name] = event.target.value;
    setData(cloneData);
  };

  const 회원가입 = async () => {
    /**
     * GET : 서버에서 가져올 때 사용
     * POST : 어떤것을 만들 때 사용
     */
    await axios({
      url: "http://localhost:4000/join",
      method: "POST",
      data: data,
    })
      .then((res) => {
        const { code, message } = res.data;
        if (code === "success") {
          alert(message);
          navigation("/login");
        }
      })
      .catch((e) => {
        console.log("join Error", e);
      });

    console.log(data);
  };

  return (
    <div>
      <input type="text" name="id" onChange={데이터변경} />
      <input type="password" name="pw" onChange={데이터변경} />
      <button type="button" onClick={회원가입}>
        회원가입
      </button>
    </div>
  );
}

function Login() {
  const navigation = useNavigate();

  const [data, setData] = React.useState({
    id: "",
    pw: "",
  });

  const 데이터변경 = (event) => {
    const name = event.target.name;
    const cloneData = { ...data };
    cloneData[name] = event.target.value;
    setData(cloneData);
  };

  const 로그인 = async () => {
    await axios({
      url: "http://localhost:4000/login",
      method: "POST",
      data: data,
    })
      .then((res) => {
        alert(res.data.message);

        if (res.data.code === "success") {
          window.location.href = "/";
        }
      })
      .catch((e) => {
        console.log("로그인에러", e);
      });
  };

  return (
    <div>
      <input name="id" onChange={데이터변경} />
      <input type="password" name="pw" onChange={데이터변경} />
      <button type="button" onClick={로그인}>
        로그인
      </button>
    </div>
  );
}

function Article() {
  const { seq } = useParams();

  const [article, setArticle] = React.useState({});
  const [reply, setReply] = React.useState([]);

  const 게시판상세정보가져오기 = async () => {
    await axios({
      url: "http://localhost:4000/article_row",
      params: {
        seq: seq,
      },
    }).then((response) => {
      setArticle(response.data.article);
      setReply(response.data.reply);
    });
  };

  React.useEffect(() => {
    게시판상세정보가져오기();
  }, []);
  const [replyText, setReplyText] = React.useState("");
  const 댓글정보저장 = (event) => {
    setReplyText(event.target.value);
  };

  const 댓글쓰기 = async () => {
    await axios({
      url: "http://localhost:4000/reply",
      method: "POST",
      data: {
        replyText: replyText,
        seq: seq,
      },
    }).then((response) => {});
  };

  return (
    <div className="ui-wrap">
      <div className="ui-body-wrap">
        <h2>{article.title}</h2>
        <div className="ui-body">
          <p>{article.body}</p>
        </div>

        <h3>댓글</h3>

        <div className="ui-reply">
          {reply.length > 0 &&
            reply.map((item, index) => {
              return <div>{item.body}</div>;
            })}
        </div>

        <form className="ui-reply-form">
          <textarea onChange={댓글정보저장}></textarea>
          <button className="ui-blue-button" onClick={댓글쓰기}>
            댓글쓰기
          </button>
        </form>
      </div>
    </div>
  );
}

function Main() {
  const { loginUser } = React.useContext(StoreContext);
  const [article, setArticle] = React.useState({});
  const navigation = useNavigate();

  const 게시글정보가져오기 = async () => {
    await axios({
      url: "http://localhost:4000/article",
      method: "GET",
    }).then((response) => {
      setArticle(response.data);
    });
  };

  React.useEffect(() => {
    게시글정보가져오기();
  }, []);

  const 글등록페이지이동 = () => {
    navigation("/write");
  };

  return (
    <div className="ui_wrap">
      {/* <h2>{loginUser.nickname}님 안녕하세요!</h2> */}
      <button className="ui-green-button" onClick={글등록페이지이동}>
        글등록
      </button>
      <table className="ui-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>내용</th>
            <th>작성자</th>
          </tr>
        </thead>
        <tbody>
          {article.length > 0 &&
            article.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.title}</td>
                  <td>{item.body}</td>
                  <td>{item.nickname}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

/**
 *
 * 1. React Router DOM
 * 2. Context provider
 */

const StoreContext = React.createContext({});

function App() {
  const [loginUser, setLoginUser] = React.useState({});

  const 세션정보가져오기 = async () => {
    await axios({
      url: "http://localhost:4000/user",
    }).then((res) => {
      setLoginUser(res.data);
    });
  };

  React.useEffect(() => {
    세션정보가져오기();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        loginUser,
      }}
    >
      <Routes>
        <Route exact path="/" element={<Main />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/join" element={<Join />} />
        <Route exact path="/write" element={<Write />} />
        <Route exact path="/article/:seq" element={<Article />} />
      </Routes>
    </StoreContext.Provider>
  );
}

export default App;

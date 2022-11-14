import axios from "axios";
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
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

function Main() {
  const { loginUser } = React.useContext(StoreContext);
  const [article, setArticle] = React.useState({});

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

  return (
    <div>
      <h2>{loginUser.nickname}님 안녕하세요!</h2>
      <table>
        <thead>
          <tr>
            <th>제목</th>
            <th>내용</th>
            <th>작성자</th>
          </tr>
        </thead>
        <tbody>
          {article.length > 0 &&
            article.map((item) => {
              return (
                <tr key={item.seq}>
                  <th>{item.title}</th>
                  <th>{item.body}</th>
                  <th>{item.user_seq}</th>
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
      </Routes>
    </StoreContext.Provider>
  );
}

export default App;

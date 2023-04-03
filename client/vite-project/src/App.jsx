import { useEffect, useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logout, setlogout] = useState(false);
  useEffect(() => {
    console.log(username);
    console.log(password);
  }, [username, password]);
  const jwtaxios = axios.create();
  jwtaxios.interceptors.request.use(
    async (req) => {
      let currentDate = new Date();
      const decodedtoken = await jwt_decode(user.accesstoken);
      if (decodedtoken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        req.headers["authorization"] = "bearer " + data.accesstoken;
      }
      return req;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const refreshToken = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/refresh", {
        token: user.refreshtoken,
      });
      setUser({
        ...user,
        accesstoken: res.data.accesstoken,
        refreshtoken: res.data.refreshtoken,
      });
      console.log(user);
      console.log(jwt_decode(user.accesstoken));
      return res.data;
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/api/login", {
        username,
        password,
      });
      console.log(res.data);
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      await jwtaxios.delete(`http://localhost:3001/api/users/${id}`, {
        headers: { authorization: "Bearer " + user.accesstoken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };
  const handleLogOut = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3001/api/logout",
        {
          token: user.refreshtoken,
        },
        {
          headers: {
            authorization: "Bearer " + user.accesstoken,
          },
        }
      );
      console.log(res.data);
      setlogout(true);
    } catch (error) {}
  };
  return (
    <div className="container">
      {/* {console.log("this is user", user)} */}
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.username}</b>.
          </span>
          <span>Delete Users:</span>
          <button className="deleteButton" onClick={() => handleDelete(1)}>
            Delete Vinay
          </button>
          <button className="deleteButton" onClick={() => handleDelete(2)}>
            Delete amit
          </button>
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
          <div>
            <button onClick={() => handleLogOut()}>Log Out</button>
            {logout && (
              <span className="success">
                User has been logged out successfully...
              </span>
            )}
          </div>
          <div>
            <button onClick={() => refreshToken()}>Refresh token</button>
          </div>
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleSubmit}>
            <span className="formTitle">Lama Login</span>
            <input
              type="text"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submitButton">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;

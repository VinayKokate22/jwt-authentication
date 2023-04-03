const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");

let refreshtokens = [];
const user = [
  {
    id: 1,
    username: "vinay",
    password: "12345",
    email: "vinay@123",
    isAdmin: true,
  },
  {
    id: 2,
    username: "amit",
    password: "12345",
    email: "amit@123",
    isAdmin: false,
  },
];
const verify = async (req, res, next) => {
  const authHeader = await req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, "34324343", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid");
      }
      console.log("token is verified");
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("you are not authenticated");
  }
};
app.use(cors());
app.use(express.json());
app.post("/api/refresh", async (req, res) => {
  //take the refresh token
  const refreshtoken = await req.body.token;

  console.log(refreshtoken);

  //send err if there is no token or its invalid
  if (!refreshtoken) return res.status(401).json("you are not authenticated");
  if (!refreshtokens.includes(refreshtoken)) {
    return res.status(403).json("refresh token is not valid");
  }
  jwt.verify(refreshtoken, "myrefreshtserectkey", (err, user) => {
    err && console.log(err);
    refreshtokens = refreshtokens.filter((token) => {
      return token !== refreshtoken;
    });
    const newaccesstoken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      "34324343",
      { expiresIn: "15m" }
    );
    const newrefreshtoken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      "myrefreshtserectkey"
    );
    refreshtokens.push(newrefreshtoken);
    res.status(200).json({
      accesstoken: newaccesstoken,
      refreshtoken: newrefreshtoken,
      refreshtokens,
    });
  });
  //if everything is ok,create new access token ,refresh token and send to user
});
app.post("/api/logout", verify, async (req, res) => {
  const refreshtoken = await req.body.token;
  if (!refreshtoken) {
    return res.status(401).json("already logged out");
  }
  refreshtokens = refreshtokens.filter((token) => {
    return token !== refreshtoken;
  });
  res.status(200).json("you logged out successfully.");
});
app.post("/api/login", async (req, res) => {
  const { username, password } = await req.body;
  if (username && password) {
    if (
      user.find((u) => {
        return u.username === username;
      })
    ) {
      const loggeduser = user.find((u) => {
        return u.username === username;
      });
      const accesstoken = jwt.sign(
        {
          id: loggeduser.id,
          isAdmin: loggeduser.isAdmin,
        },
        "34324343",
        { expiresIn: "15m" }
      );
      const refreshtoken = jwt.sign(
        {
          id: loggeduser.id,
          isAdmin: loggeduser.isAdmin,
        },
        "myrefreshtserectkey"
      );
      refreshtokens.push(refreshtoken);
      res.json({
        id: loggeduser.id,
        username: loggeduser.username,
        isAdmin: loggeduser.isAdmin,
        accesstoken,
        refreshtoken,
      });
    } else {
      res.status(404).json("invalid username or password");
    }
  } else {
    res.status(400).json("please enter username and password");
  }
});
app.delete("/api/users/:userId", verify, (req, res) => {
  console.log(req.user.id.toString());
  console.log(req.params.userId);
  console.log(req.user.isAdmin);
  if (req.user.id.toString() === req.params.userId || req.user.isAdmin) {
    res.status(200).json("user has been deleted ");
  } else {
    res.status(403).json("you are not allowed to delete this user");
  }
});
app.listen(process.env.PORT, () => {
  console.log(
    `the server is connected to the server at the port :: ${process.env.PORT}`
  );
});

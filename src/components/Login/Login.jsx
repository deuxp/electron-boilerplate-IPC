import { useState } from "react";
import style from "./Login.module.css";

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmail = e => {
    e.preventDefault();
    setEmail(e.target.value);
  };
  const handlePassword = e => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const handleOnSubmit = e => {
    e.preventDefault();
    const xcheckEmail = email.includes("<" || ">");
    const xcheckPassword = email.includes("<" || ">");
    if (!xcheckEmail && !xcheckPassword) {
      login(email, password);
    }
    if (xcheckEmail || xcheckPassword) {
      console.log("XXS warning");
    }
  };

  const login = (email, password) => {
    const credentials = { email, password };
    window.bridge.login(credentials, access => {
      if (access) {
        setIsLoggedIn(true);
      }
    });
  };
  return (
    <>
      <div className={style.box}>
        <h1>User Login</h1>
        <input
          onChange={handleEmail}
          type="text"
          placeholder="user@example.com"
        />
        <input
          onChange={handlePassword}
          type="password"
          placeholder="password"
        />
        <button onClick={handleOnSubmit}>submit</button>
      </div>
    </>
  );
}
export default Login;

import { useState } from "react";
import style from "./Login.module.css";

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [needToRegister, setNeedToRegister] = useState(true);
  const [newPassword, setNewPassword] = useState(false);

  // required fields verification
  const [loginFail, setLoginFail] = useState(false);
  const [required, setRequired] = useState(false);
  const [doPassMatch, setDoPassMatch] = useState(false);
  const [isEmail, setIsEmail] = useState(false);
  const [reset, setReset] = useState(false);
  const [message, setMessage] = useState("");

  const clearMsgs = () => {
    setLoginFail(false);
    setRequired(false);
    setDoPassMatch(false);
    setIsEmail(false);
    setMessage("");
  };

  const clearFormData = () => {
    setEmail("");
    setName("");
    setConfirm("");
    setPassword("");
    setRequired(false);
    setDoPassMatch(false);
    setIsEmail(false);
    setNewPassword(false);
  };
  const backToLogin = () => {
    setReset(false);
    setNewPassword(false);
    clearFormData();
    clearMsgs();
  };

  const handleRegisterToggle = () => {
    setNeedToRegister(prev => !prev);
    setReset(false);
    setMessage("");
    clearFormData();
  };

  // const handleForgot = () => {
  //   setReset(true);
  // };

  function validEmail(email) {
    const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (re.test(email)) return true;
    return false;
  }
  const login = (email, password) => {
    const credentials = { email, password };
    window.bridge.login(credentials, res => {
      clearFormData();
      if (res.login) {
        setIsLoggedIn(true);
        setLoginFail(false);
        setMessage("");
      }
      if (!res.login) {
        console.log("login fail");
        setLoginFail(true);
      }
    });
  };

  const register = (email, password, password_confirm, name) => {
    const credentials = { email, password, password_confirm, name };
    window.bridge.register(credentials, res => {
      console.log("what is access: ", res);
      if (res.register) {
        login(email, password, password_confirm);
        clearFormData();
      }
      if (!res.register) {
        console.log("user not registered try again later");
        clearFormData();
        setLoginFail(true);
      }
    });
  };

  const resetPassword = email => {
    window.bridge.resetPassword(email, res => {
      if (!res.reset) {
        setMessage("User not found, please re-enter email");
        setEmail("");
        console.log("password reset error");
      }
      if (res.reset) {
        setNewPassword(res.reset);
        setReset(false);
      }
    });
  };

  const postNewPassword = (email, password, password_confirm) => {
    const credentials = { email, password, password_confirm };
    window.bridge.postNewPassword(credentials, res => {
      if (!res.update) {
        return setMessage("Token has expired, please check email");
      }
      // this is where you clear everything and login
      if (res.update) {
        clearFormData();
        setNeedToRegister(true); // show login
        setMessage("Please re-enter your login information");
      }
    });
  };

  const handleOnSubmit = e => {
    e.preventDefault();
    clearMsgs();
    if ((!needToRegister || newPassword) && password !== confirm) {
      return setDoPassMatch(true);
    }
    // Validate Fields:
    // Login: if "needToRegister"
    if (needToRegister && !reset && (!email || !password))
      return setRequired(true);
    // Register: if "!needToRegister"
    if (!needToRegister && (!name || !email || !password))
      return setRequired(true);
    if (!validEmail(email)) return setIsEmail(true);
    // matching passwords:
    if (!needToRegister && password !== confirm) return setDoPassMatch(true);

    // Action:
    if (reset) return resetPassword(email);
    if (newPassword) return postNewPassword(email, password, confirm);
    if (needToRegister) return login(email, password);
    if (!needToRegister) return register(email, password, confirm, name);
  };

  return (
    <>
      <div className={style.box}>
        <h1>{needToRegister ? "User Login" : "Register New User"}</h1>
        {(reset || newPassword) && (
          // {reset && !newPassword && (
          <div onClick={backToLogin} className={style.register}>
            Back to Login
          </div>
        )}
        {!reset && !newPassword && (
          <div onClick={handleRegisterToggle} className={style.register}>
            {needToRegister ? "register" : "login"}
          </div>
        )}
        {!needToRegister && !newPassword && !reset && (
          <input
            onChange={e => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Name"
          />
        )}
        {!newPassword && (
          <input
            onChange={e => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="user@example.com"
          />
        )}
        {(!reset || newPassword) && (
          <input
            onChange={e => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="password"
          />
        )}
        {!reset && needToRegister && !newPassword && (
          <div onClick={() => setReset(true)} className={style.forgot}>
            reset password
          </div>
        )}
        {(!needToRegister || newPassword) && (
          <input
            onChange={e => setConfirm(e.target.value)}
            value={confirm}
            type="password"
            placeholder="re-enter password"
          />
        )}
        {reset && <div className={style.email}>Enter your email to reset</div>}
        {newPassword && (
          <div className={style.email}>
            Check your Email<br></br> Then enter new Password
          </div>
        )}
        <button onClick={handleOnSubmit}>submit</button>
        {doPassMatch && <p className={style.msg}>*Passwords do not match</p>}
        {required && <p className={style.msg}>*Please fill required fields</p>}
        {isEmail && <p className={style.msg}>*Not a valid email address</p>}
        {loginFail && (
          <p className={style.msg}>
            *Login/Registration attempt failed, please try again
          </p>
        )}
        <p className={style.msg}>{message}</p>
      </div>
    </>
  );
}
export default Login;

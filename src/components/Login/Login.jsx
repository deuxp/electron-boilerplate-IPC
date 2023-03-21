import { useState } from "react";
import style from "./Login.module.css";

function Login({ setIsLoggedIn, setNeedToRegister, needToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");

  // required fields verification
  const [loginFail, setLoginFail] = useState(false);
  const [required, setRequired] = useState(false);
  const [doPassMatch, setDoPassMatch] = useState(false);
  const [isEmail, setIsEmail] = useState(false);

  const clearFormData = () => {
    setEmail("");
    setName("");
    setConfirm("");
    setPassword("");
    setRequired(false);
    setDoPassMatch(false);
    setIsEmail(false);
  };

  const login = (email, password, password_confirm) => {
    const credentials = { email, password, password_confirm };
    window.bridge.login(credentials, res => {
      clearFormData();
      if (res.login) {
        setIsLoggedIn(true);
        setLoginFail(false);
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

  const handleOnSubmit = e => {
    e.preventDefault();
    if (!needToRegister && password !== confirm) {
      setDoPassMatch(true);
      return;
    }

    // required fields logic

    // Login: if "needToRegister" && (email empty || password empty)
    // set error msg::required fields; return
    if (needToRegister && (!email || !password)) return setRequired(true);

    // Register: if "!needToRegister" && (name ||  email empty || password empty)
    // set error msg::required fields; return
    if (!needToRegister && (!name || !email || !password))
      return setRequired(true);

    if (!validEmail(email)) return setIsEmail(true);

    // matching passwords: if password !== confirm
    // set error msg::passwords; return
    if (!needToRegister && password !== confirm) return setDoPassMatch(true);

    if (needToRegister) login(email, password);
    if (!needToRegister) register(email, password, confirm, name);
  };

  return (
    <>
      <div className={style.box}>
        <h1>{needToRegister ? "User Login" : "Register New User"}</h1>
        <div
          onClick={() => setNeedToRegister(prev => !prev)}
          className={style.register}
        >
          {needToRegister ? "register" : "login"}
        </div>

        {!needToRegister && (
          <input
            onChange={e => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Name"
          />
        )}

        <input
          onChange={e => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="user@example.com"
        />
        <input
          onChange={e => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder="password"
        />
        {!needToRegister && (
          <input
            onChange={e => setConfirm(e.target.value)}
            value={confirm}
            type="password"
            placeholder="re-enter password"
          />
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
      </div>
    </>
  );
}
export default Login;

function validEmail(email) {
  const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (re.test(email)) return true;
  return false;
}

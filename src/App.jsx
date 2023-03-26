import { useEffect } from "react";
import style from "./App.module.css";
import Character from "./components/Character/Character";
import useData from "./hooks/useData";
import Button from "./components/Button/Button";
import Login from "./components/Login/Login";

function App() {
  const { data, getCharacter, isLoggedIn, setIsLoggedIn } = useData();

  const refreshToken = () => {
    window.bridge.refreshAccess(res => {
      if (res.refresh) {
        getCharacter();
      }
      if (!res.refresh) {
        setIsLoggedIn(false);
      }
    });
  };

  useEffect(() => {
    window.bridge.refreshAccess(res => {
      if (res.refresh) {
        setIsLoggedIn(true);
      }
    });
  }, []);

  const handleGetCharacter = () => {
    window.bridge.verifyAccess(res => {
      console.log(res);
      if (res.access) {
        getCharacter();
      }
      if (!res.access) {
        refreshToken();
        console.log("access_token expired, refreshing");
      }
    });
  };

  return (
    <div className={style.main}>
      <div className={style.box}>
        {!isLoggedIn && <Login setIsLoggedIn={setIsLoggedIn} />}

        {isLoggedIn && <Character data={data} getCharacter={getCharacter} />}
        {isLoggedIn && (
          <Button getCharacter={handleGetCharacter}>Roll Character</Button>
        )}
      </div>
    </div>
  );
}

export default App;

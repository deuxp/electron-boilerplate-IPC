import style from "./App.module.css";
import Character from "./components/Character/Character";
import useData from "./hooks/useData";
import Button from "./components/Button/Button";
import Login from "./components/Login/Login";

function App() {
  const { data, getCharacter, isLoggedIn, setIsLoggedIn } = useData();

  return (
    <div className={style.main}>
      <div className={style.box}>
        {!isLoggedIn && <Login setIsLoggedIn={setIsLoggedIn} />}
        {isLoggedIn && <Character data={data} />}
        {isLoggedIn && (
          <Button getCharacter={getCharacter}>Roll Character</Button>
        )}
      </div>
    </div>
  );
}

export default App;

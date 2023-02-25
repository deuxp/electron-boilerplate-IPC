import style from "./App.module.css";
import Character from "./components/Character/Character";
import useData from "./hooks/useData";
import Button from "./components/Button/Button";

function App() {
  const { data, getCharacter } = useData();

  return (
    <div className={style.main}>
      <div className={style.box}>
        <Character data={data} />
        <Button getCharacter={getCharacter}>Roll Character</Button>
      </div>
    </div>
  );
}

export default App;

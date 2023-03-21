import { useEffect } from "react";
import style from "./Character.module.css";

function Character({ data, getCharacter }) {
  useEffect(() => {
    getCharacter();
  }, []);

  return (
    <div className={style.box}>
      <p className={style.name}>{data.name}</p>
      <p>({data.species})</p>
      {data && <img className={style.image} src={data.image} alt="character" />}
    </div>
  );
}

export default Character;

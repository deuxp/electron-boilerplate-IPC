import React from "react";
import style from "./Character.module.css";

function Character({ data }) {
  // const print = JSON.stringify(data);
  return (
    <div className={style.box}>
      <p className={style.name}>{data.name}</p>
      <p>({data.species})</p>
      <img className={style.image} src={data.image} alt="character" />
    </div>
  );
}

export default Character;

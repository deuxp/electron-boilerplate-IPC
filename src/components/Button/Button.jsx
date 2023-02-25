import React from "react";
import style from "./Button.module.css";

function Button({ children, getCharacter }) {
  return (
    <div className={style.box}>
      <button onClick={getCharacter} className={style.button}>
        {children}
      </button>
    </div>
  );
}

export default Button;

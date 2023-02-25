import { useEffect, useState } from "react";

function useData() {
  const [data, setData] = useState({});

  function getRandomIndex() {
    let num = Math.random() * 826;
    return Math.floor(num);
  }
  function getCharacter() {
    let index;
    index = getRandomIndex();
    fetch(`https://rickandmortyapi.com/api/character/${index}`)
      .then(res => {
        let data = res.json();
        return data;
      })
      .then(data => {
        console.log(data);
        setData(data);
        return data;
      })
      .catch(err => {
        console.log(err);
      });
  }

  useEffect(() => {
    getCharacter();
  }, []);

  return { data, getCharacter };
}

export default useData;

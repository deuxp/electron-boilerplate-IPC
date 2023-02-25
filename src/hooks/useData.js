import { useEffect, useState, useCallback } from "react";

function useData() {
  const [data, setData] = useState({});

  function getRandomIndex() {
    let num;
    num = Math.random() * 825;
    num = Math.floor(num);
    return num > 0 ? num : 1;
  }
  const getCharacter = useCallback(() => {
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
  }, []);

  useEffect(() => {
    getCharacter();
  }, [getCharacter]);

  return { data, getCharacter };
}

export default useData;

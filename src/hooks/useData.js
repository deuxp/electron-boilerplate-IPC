import { useEffect, useState } from "react";

function useData() {
  const [data, setData] = useState({});

  const getCharacter = () => {
    window.bridge.fetchCharacter(response => {
      console.log(response.id);
      setData(response);
    });
  };

  useEffect(() => {
    getCharacter();
  }, []);

  return { data, getCharacter };
}

export default useData;

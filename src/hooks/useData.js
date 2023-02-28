import { useEffect, useState } from "react";

function useData() {
  const [data, setData] = useState({});

  const getCharacter = () => {
    window.bridge.fetchCharacter(response => {
      setData(response);
    });
  };

  useEffect(() => {
    getCharacter();
  }, []);

  return { data, getCharacter };
}

export default useData;

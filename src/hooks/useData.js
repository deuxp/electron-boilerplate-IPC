import { useEffect, useState } from "react";

function useData() {
  const [data, setData] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getCharacter = () => {
    window.bridge.fetchCharacter(response => {
      setData(response);
    });
  };

  useEffect(() => {
    getCharacter();
  }, []);

  return {
    data,
    getCharacter,
    isLoggedIn,
    setIsLoggedIn,
  };
}

export default useData;

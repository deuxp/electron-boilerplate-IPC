import { useState } from "react";

function useData() {
  const [data, setData] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getCharacter = () => {
    window.bridge.fetchCharacter(response => {
      setData(response);
    });
  };

  return {
    data,
    getCharacter,
    isLoggedIn,
    setIsLoggedIn,
  };
}

export default useData;

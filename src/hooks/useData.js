import { useEffect, useState } from "react";

function useData() {
  const [data, setData] = useState({});

  const getCharacter = () => {
    window.bridge.fetchCharacter(response => {
      setData(response);
    });
  };

  const getHoney = () => {
    window.bridge.getHoney();
  };
  const refresh = () => {
    window.bridge.refresh();
  };
  const login = () => {
    window.bridge.login();
  };

  useEffect(() => {
    getCharacter();
  }, []);

  return { data, getCharacter, getHoney, login, refresh };
}

export default useData;

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("cv_theme") || "gold"
  );

useEffect(()=>{
 document.documentElement.dataset.theme = theme;
 localStorage.setItem("cv_theme",theme);
},[theme]);


  useEffect(() => {
    localStorage.setItem("cv_theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

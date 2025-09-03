import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/NavBar.tsx
import { Link } from "react-router-dom";
const NavBar = () => {
    return (_jsx("nav", { style: navStyle, children: _jsxs("ul", { style: ulStyle, children: [_jsx("li", { children: _jsx(Link, { to: "/admin", style: linkStyle, children: "Admin" }) }), _jsx("li", { children: _jsx(Link, { to: "/tableau", style: linkStyle, children: "Tableau" }) })] }) }));
};
const navStyle = {
    backgroundColor: "#222",
    padding: "1rem",
    marginBottom: "2rem",
};
const ulStyle = {
    listStyle: "none",
    display: "flex",
    gap: "1rem",
    margin: 0,
    padding: 0,
};
const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
};
export default NavBar;

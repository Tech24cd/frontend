// src/components/NavBar.tsx
import { Link } from "react-router-dom";
import React from "react";

const NavBar: React.FC = () => {
  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li>
          <Link to="/admin" style={linkStyle}>
            Admin
          </Link>
        </li>
        <li>
          <Link to="/tableau" style={linkStyle}>
            Tableau
          </Link>
        </li>
      </ul>
    </nav>
  );
};

const navStyle: React.CSSProperties = {
  backgroundColor: "#222",
  padding: "1rem",
  marginBottom: "2rem",
};

const ulStyle: React.CSSProperties = {
  listStyle: "none",
  display: "flex",
  gap: "1rem",
  margin: 0,
  padding: 0,
};

const linkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
};

export default NavBar;

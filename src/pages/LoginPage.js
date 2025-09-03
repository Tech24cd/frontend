import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import illustrationImage from "../assets/images-2.png";
const LoginPage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, mot_de_passe: password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erreur lors de la connexion");
      }
      const data = await response.json();
      // Sauvegarder token et rôle
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userId", data.user.id);

      // Redirection selon le rôle
      switch (data.user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "technicien":
          navigate("/tech");
          break;
        case "prestataire":
          navigate("/prestataire");
          break;
        default:
          alert("Rôle utilisateur inconnu");
          break;
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue");
      }
    }
  };
  return _jsxs("div", {
    className: `page-container ${darkMode ? "dark" : "light"}`,
    children: [
      _jsx("button", {
        className: "toggle-theme",
        onClick: toggleDarkMode,
        "aria-label": "Toggle theme",
        children: darkMode ? "🌞" : "🌙",
      }),
      _jsxs("div", {
        className: "login-wrapper",
        children: [
          _jsxs("aside", {
            className: "illustration",
            children: [
              _jsx("h1", { children: "Bienvenue !" }),
              _jsx("p", {
                children:
                  "Connectes-toi pour g\u00E9rer ta mission efficacement.",
              }),
              _jsx("img", { src: illustrationImage, alt: "Illustration" }),
            ],
          }),
          _jsxs("form", {
            className: "login-card",
            onSubmit: handleSubmit,
            children: [
              _jsx("h2", { children: "Connexion" }),
              error &&
                _jsx("p", {
                  style: { color: "red", marginBottom: 10 },
                  children: error,
                }),
              _jsx("label", { htmlFor: "email", children: "Adresse email" }),
              _jsx("input", {
                type: "email",
                id: "email",
                placeholder: "email@example.com",
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
              }),
              _jsx("label", { htmlFor: "password", children: "Mot de passe" }),
              _jsxs("div", {
                className: "password-wrapper",
                children: [
                  _jsx("input", {
                    type: showPassword ? "text" : "password",
                    id: "password",
                    placeholder:
                      "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                    required: true,
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                  }),
                  _jsx("button", {
                    type: "button",
                    className: "show-password-btn",
                    onClick: toggleShowPassword,
                    "aria-label": showPassword
                      ? "Masquer mot de passe"
                      : "Afficher mot de passe",
                    children: showPassword ? "🙈" : "👁️",
                  }),
                ],
              }),
              _jsx("button", { type: "submit", children: "Se connecter" }),
              _jsxs("p", {
                className: "signup-text",
                children: [
                  "Pas encore de compte ?",
                  " ",
                  _jsx(Link, {
                    to: "/create-account",
                    children: "Cr\u00E9er un compte",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsx("style", {
        children: `
        /* Variables */
        :root {
          --color-bg-dark: #0f0f0f;
          --color-bg-light: #f9f9f9;
          --color-card-dark: #FFB347;
          --color-card-light: #fff;
          --color-text-dark: #eee;
          --color-text-light: #222;
          --color-primary: #1BOC55;
          --color-primary-hover: #0096c7;
          --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Page container */
        .page-container {
          min-height: 100vh;
          font-family: var(--font-family);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          transition: background-color 0.4s ease, color 0.4s ease;
          position: relative;
        }
        .page-container.dark {
          background: linear-gradient(to right, var(--color-bg-dark), #1a1a1a);
          color: var(--color-text-dark);
        }
        .page-container.light {
          background: linear-gradient(to right, #e3f2fd, #bbdefb);
          color: var(--color-text-light);
        }

        /* Theme toggle */
        .toggle-theme {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: inherit;
          transition: transform 0.3s ease;
          user-select: none;
        }
        .toggle-theme:hover {
          transform: scale(1.2);
        }

        /* Login wrapper: side by side */
        .login-wrapper {
          display: flex;
          background: var(--color-card-dark);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.9);
          overflow: hidden;
          max-width: 900px;
          width: 100%;
          color: var(--color-text-dark);
          transition: background-color 0.4s ease;
        }
        .page-container.light .login-wrapper {
          background: var(--color-card-light);
          color: var(--color-text-light);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        /* Illustration section */
        .illustration {
          flex: 1;
          background: #0077b6;
          color: white;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .page-container.light .illustration {
          background: #90caf9;
          color: #0d47a1;
        }
        .illustration h1 {
          font-size: 2.8rem;
          margin-bottom: 1rem;
          user-select: none;
        }
        .illustration p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          user-select: none;
        }
        .illustration img {
          max-width: 100%;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          user-select: none;
        }

        /* Login form */
        .login-card {
          flex: 1;
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: inherit;
          color: inherit;
        }

        .login-card h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--color-primary);
        }

        label {
          font-size: 1rem;
          font-weight: 600;
        }

        input {
          padding: 0.7rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
          background-color: #222;
          color: var(--color-text-dark);
          transition: background-color 0.3s ease;
        }
        .page-container.light input {
          background-color: #f5f5f5;
          color: var(--color-text-light);
          box-shadow: inset 0 0 6px rgba(0,0,0,0.1);
        }
        input:focus {
          background-color: #2a2a2a;
        }
        .page-container.light input:focus {
          background-color: #e3f2fd;
        }

        /* Password input with button */
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .show-password-btn {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: var(--color-primary);
          user-select: none;
          padding: 0;
          line-height: 1;
        }

        button[type="submit"] {
          background-color: var(--color-primary);
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          margin-top: 1rem;
          transition: background-color 0.3s ease;
        }
        button[type="submit"]:hover {
          background-color: var(--color-primary-hover);
        }

        .signup-text {
          font-size: 0.9rem;
          margin-top: 1rem;
          text-align: center;
          color: inherit;
        }
        .signup-text a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
        }
        .signup-text a:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-wrapper {
            flex-direction: column;
          }
          .illustration {
            padding: 2rem;
            order: 2;
          }
          .login-card {
            padding: 2rem;
            order: 1;
          }
        }
      `,
      }),
    ],
  });
};
export default LoginPage;

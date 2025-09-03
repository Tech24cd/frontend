import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const TechnicienPage = () => {
  const [missions, setMissions] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/missions", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Non autorisé");
        return res.json();
      })
      .then((data) => setMissions(data))
      .catch((err) => {
        console.error("Erreur chargement missions (tech)", err);
        setMissions([]);
      });
  }, []);

  const formatDateTime = (dt) => {
    const date = new Date(dt);
    return date.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div className={`page-container ${darkMode ? "dark" : "light"}`}>
      {/* Bouton thème */}
      <button className="toggle-theme" onClick={toggleDarkMode}>
        {darkMode ? "🌞" : "🌙"}
      </button>

      {/* Navigation */}
      <nav style={{ position: "fixed", top: "1rem", left: "1rem" }}>
        <Link
          to="/tableTech"
          style={{
            padding: "0.5rem 1rem",
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          🧩 Tableau
        </Link>
        <Link
          to="/planningTech"
          style={{
            padding: "0.5rem 1rem",
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            marginLeft: "1rem",
          }}
        >
          📅 Planning
        </Link>
      </nav>

      {/* Contenu principal */}
      <div className="technicien-wrapper">
        <h1>Mes missions</h1>
        <section className="missions-list">
          <h2>Liste des missions</h2>
          {missions.length === 0 ? (
            <p>Aucune mission assignée pour ce filtre.</p>
          ) : (
            <ul>
              {missions.map((m) => (
                <li key={m.id}>
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                  <p>
                    <strong>Ville:</strong> {m.city}
                  </p>
                  <p>
                    <strong>Adresse:</strong> {m.address}
                  </p>
                  <p>
                    <strong>Montage:</strong> {formatDateTime(m.setupDateTime)}
                  </p>
                  <p>
                    <strong>Démontage:</strong>{" "}
                    {formatDateTime(m.teardownDateTime)}
                  </p>
                  <p>
                    <strong>Contact:</strong> {m.contactName} - {m.contactPhone}
                  </p>
                  <p>
                    <strong>Intervenant 1:</strong>{" "}
                    {m.intervenant1
                      ? `${m.intervenant1.nom} (${m.intervenant1.email} - ${m.intervenant1.telephone})`
                      : "-"}
                  </p>
                  <p>
                    <strong>Intervenant 2:</strong>{" "}
                    {m.intervenant2
                      ? `${m.intervenant2.nom} (${m.intervenant2.email} - ${m.intervenant2.telephone})`
                      : "-"}
                  </p>
                  <p>
                    <strong>Prestataire:</strong>{" "}
                    {m.prestataire
                      ? `${m.prestataire.nom} (${m.prestataire.email})`
                      : "-"}
                  </p>
                  <p>
                    <strong>Transporteur:</strong> {m.transporteur || "-"}
                  </p>
                  <div>
                    <strong>Documents liés :</strong>
                    {m.Documents && m.Documents.length > 0 ? (
                      <ul>
                        {m.Documents.map((doc) => (
                          <li key={doc.id}>
                            <a
                              href={
                                doc.url ?? `http://localhost:3000${doc.path}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              📎 {doc.filename}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Aucun document</p>
                    )}
                  </div>

                  <p>
                    <strong>Statut :</strong> {m.status}
                  </p>
                  {/* Changement de statut autorisé */}
                  {["non débuté", "montage", "démontage"].includes(
                    m.status
                  ) && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        let nextStatus = "";
                        if (m.status === "non débuté") nextStatus = "montage";
                        else if (m.status === "montage")
                          nextStatus = "démontage";
                        else if (m.status === "démontage")
                          nextStatus = "terminé";
                        if (!nextStatus) return;
                        try {
                          const res = await fetch(
                            `http://localhost:3000/api/missions/${m.id}/status`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              credentials: "include",
                              body: JSON.stringify({ status: nextStatus }),
                            }
                          );
                          if (res.ok) {
                            setMissions((prev) =>
                              prev.map((miss) =>
                                miss.id === m.id
                                  ? { ...miss, status: nextStatus }
                                  : miss
                              )
                            );
                          } else {
                            alert("Erreur lors du changement de statut");
                          }
                        } catch (err) {
                          alert("Erreur réseau");
                        }
                      }}
                    >
                      <button type="submit" style={{ marginTop: 8 }}>
                        Passer à&nbsp;
                        {m.status === "non débuté"
                          ? "Montage"
                          : m.status === "montage"
                          ? "Démontage"
                          : "Terminé"}
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <style>{`
        :root {
          --color-bg-dark: #0f0f0f;
          --color-bg-light: #f9f9f9;
          --color-card-dark: #303030;
          --color-card-light: #fff;
          --color-text-dark: #FFB347;
          --color-text-light: #222;
          --color-primary: #1b9c55;
          --color-primary-hover: #0096c7;
          --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .page-container {
          min-height: 100vh;
          font-family: var(--font-family);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 2rem;
          background: var(--color-bg-dark);
          color: var(--color-text-dark);
          transition: background-color 0.4s ease, color 0.4s ease;
          position: relative;
        }
        .page-container.light {
          background: var(--color-bg-light);
          color: var(--color-text-light);
        }

        .toggle-theme {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: inherit;
          user-select: none;
          transition: transform 0.3s ease;
        }
        .toggle-theme:hover {
          transform: scale(1.2);
        }

        .technicien-wrapper {
          background: var(--color-card-dark);
          color: var(--color-text-dark);
          padding: 2rem 3rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.9);
          width: 100%;
          max-width: 900px;
          overflow-y: auto;
          max-height: 90vh;
          transition: background-color 0.4s ease;
        }
        .page-container.light .technicien-wrapper {
          background: var(--color-card-light);
          color: var(--color-text-light);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        h1 {
          margin-bottom: 1.5rem;
          font-size: 2.5rem;
          color: var(--color-primary);
          user-select: none;
          text-align: center;
        }

        h2 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.6rem;
          color: var(--color-primary);
        }

        ul {
          list-style: none;
          padding-left: 0;
        }

        li {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          background: rgba(255 255 255 / 0.05);
          box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default TechnicienPage;

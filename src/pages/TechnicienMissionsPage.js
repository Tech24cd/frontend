import { useEffect, useState } from "react";
import illustrationImage from "../assets/idem_logo.jpeg";

const TechnicienMissionsPage = () => {
  const [missions, setMissions] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const currentTechnicienId = localStorage.getItem("userId"); // Récupère l'ID utilisateur connecté

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Lors du chargement, récupère toutes les missions et ne garde que celles du technicien
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/missions`);
        if (!response.ok) throw new Error("Erreur API");
        const allMissions = await response.json();

        if (!currentTechnicienId) {
          setMissions([]);
          return;
        }
        // Filtre uniquement celles où intervenant1 ou intervenant2 correspond au user
        const filtered = allMissions.filter(
          (m) =>
            (m.intervenant1 && m.intervenant1.id === currentTechnicienId) ||
            (m.intervenant2 && m.intervenant2.id === currentTechnicienId)
        );
        setMissions(filtered);
      } catch (error) {
        console.error("Erreur chargement missions : ", error);
        setMissions([]);
      }
    };
    fetchMissions();
  }, [currentTechnicienId]);

  const formatDateTime = (dt) => new Date(dt).toLocaleString();

  return (
    <div className={`page-container ${darkMode ? "dark" : "light"}`}>
      {/* Bouton pour changer thème */}
      <button className="toggle-theme" onClick={toggleDarkMode}>
        {darkMode ? "🌞" : "🌙"}
      </button>

      {/* Partie illustration et titre */}
      <div className="login-wrapper">
        <aside className="illustration">
          <h1>Mes Missions</h1>
          <p>Voici les missions qui vous ont été assignées.</p>
          <img src={illustrationImage} alt="Illustration" />
        </aside>

        {/* Tableau missions */}
        <div className="login-card">
          <h2>Missions Assignées</h2>
          <table className="missions-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Intervenants</th>
              </tr>
            </thead>
            <tbody>
              {missions.length === 0 ? (
                <tr>
                  <td colSpan={6}>Aucune mission assignée</td>
                </tr>
              ) : (
                missions.map((mission) => (
                  <tr
                    key={mission.id}
                    className={`mission-${mission.status.replace(" ", "-")}`}
                  >
                    <td>{mission.title}</td>
                    <td>{mission.description}</td>
                    <td>{mission.status}</td>
                    <td>{formatDateTime(mission.setupDateTime)}</td>
                    <td>{formatDateTime(mission.teardownDateTime)}</td>
                    <td>
                      {mission.intervenant1 ? mission.intervenant1.nom : "—"} /{" "}
                      {mission.intervenant2 ? mission.intervenant2.nom : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
        :root {
          --color-bg: #f5f7fa;
          --color-primary: #0177ff;
          --color-primary-hover: #005ecc;
          --color-text: #333;
          --color-muted: #666;
          --color-card-bg: #fff;
          --radius: 10px;
          --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .page-container {
          background: var(--color-bg);
          min-height: 100vh;
          padding: 2rem;
          font-family: var(--font-family);
          color: var(--color-text);
          display: flex;
          justify-content: center;
          position: relative;
        }
        .dark {
          /* Mode sombre */
        }
        .light {
          /* Mode clair */
        }
        .toggle-theme {
          position: fixed;
          top: 1rem;
          right: 1rem;
          border: none;
          background: none;
          font-size: 1.6rem;
          cursor: pointer;
        }
        .login-wrapper {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          flex-wrap: wrap;
          width: 100%;
          max-width: 1200px;
        }
        aside.illustration {
          flex: 1 1 300px;
        }
        aside h1 {
          margin-bottom: 1rem;
        }
        .login-card {
          flex: 2 1 600px;
          background: var(--color-card-bg);
          padding: 2rem;
          border-radius: var(--radius);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        h2 {
          margin-bottom: 1rem;
          color: var(--color-primary);
        }
        .missions-table {
          width: 100%;
          border-collapse: collapse;
        }
        .missions-table th, .missions-table td {
          border: 1px solid #ccc;
          padding: 0.75rem;
          text-align: left;
        }
        .missions-table th {
          background-color: var(--color-primary);
          color: white;
        }
        .missions-table tr:nth-child(even) {
          background-color: rgba(255,255,255,0.05);
        }
      `}
      </style>
    </div>
  );
};

export default TechnicienMissionsPage;

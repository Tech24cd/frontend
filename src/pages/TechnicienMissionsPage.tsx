import React, { useEffect, useState } from "react";
import illustrationImage from "../assets/idem_logo.jpeg";

interface User {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  status: string;
  setupDateTime: string;
  teardownDateTime: string;
  intervenant1?: User | null;
  intervenant2?: User | null;
}

const TechnicienMissionsPage = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/missions`);
        if (!response.ok) throw new Error("Erreur API");
        const allMissions: Mission[] = await response.json();

        const currentTechnicienId = localStorage.getItem("userId");

        if (!currentTechnicienId) {
          setMissions([]);
          return;
        }

        // Filtrer missions où l'user est un des intervenants
        const filtered = allMissions.filter(
          (m) =>
            (m.intervenant1 && m.intervenant1.id === currentTechnicienId) ||
            (m.intervenant2 && m.intervenant2.id === currentTechnicienId)
        );

        setMissions(filtered);
      } catch (error) {
        console.error("Erreur chargement missions :", error);
        setMissions([]);
      }
    };

    fetchMissions();
  }, []);

  return (
    <div className={`page-container ${darkMode ? "dark" : "light"}`}>
      <button className="toggle-theme" onClick={toggleDarkMode}>
        {darkMode ? "🌞" : "🌙"}
      </button>

      <div className="login-wrapper">
        <aside className="illustration">
          <h1>Mes Missions</h1>
          <p>Voici les missions qui vous ont été assignées.</p>
          <img src={illustrationImage} alt="Illustration" />
        </aside>

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
                  <tr key={mission.id}>
                    <td>{mission.title}</td>
                    <td>{mission.description}</td>
                    <td>{mission.status}</td>
                    <td>{new Date(mission.setupDateTime).toLocaleString()}</td>
                    <td>
                      {new Date(mission.teardownDateTime).toLocaleString()}
                    </td>
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

      <style>{`
        /* Ton CSS ici, celui existant */
        .missions-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        .missions-table th, .missions-table td {
          border: 1px solid #ccc;
          padding: 0.75rem;
          text-align: left;
          font-size: 0.95rem;
        }
        .missions-table th {
          background-color: var(--color-primary);
          color: white;
        }
        .missions-table tr:nth-child(even) {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .missions-table td {
          background-color: rgba(0, 0, 0, 0.1);
        }
        .page-container.light .missions-table td {
          background-color: #fff;
        }
        .page-container.light .missions-table tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .page-container.light .missions-table th {
          background-color: #1976d2;
        }

        /* toggle-button */
        .toggle-theme {
          position: fixed;
          top: 1rem;
          right: 1rem;
          border: none;
          background: none;
          font-size: 1.6rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default TechnicienMissionsPage;

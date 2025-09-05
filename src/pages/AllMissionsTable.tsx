import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Types
type Intervenant = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
};

type Mission = {
  transporteur: ReactNode;
  id: number;
  title: string;
  description: string;
  status:
    | "en attente"
    | "validé"
    | "refusé"
    | "non débuté"
    | "montage"
    | "démontage"
    | "terminé";
  city: string;
  address: string;
  setupDateTime: string;
  teardownDateTime: string;
  contactName: string;
  contactPhone: string;
  intervenant1?: Intervenant;
  intervenant2?: Intervenant;
};

// Statuts
const STATUTS = [
  "Tous",
  "validé",
  "refusé",
  "en attente",
  "non débuté",
  "montage",
  "démontage",
  "terminé",
] as const;

const MissionsTable: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [statutFiltre, setStatutFiltre] =
    useState<(typeof STATUTS)[number]>("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof Mission | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const navigate = useNavigate();

  // Fonction pour télécharger tous les fichiers liés à une mission
  const handleDownloadAllFiles = (missionId: number) => {
    fetch(`${API_BASE_URL}/api/missions/${missionId}/download-zip`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de téléchargement");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mission_${missionId}_fichiers.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert("Erreur lors du téléchargement : " + err.message));
  };

  // Gestion des fichiers par mission
  const [filesByMission, setFilesByMission] = useState<{
    [missionId: number]: File[];
  }>({});

  // Récupération des missions
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/missions/admin", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: Mission[]) => setMissions(data))
      .catch((err) =>
        console.error("Erreur lors du chargement des missions", err)
      );
  }, []);

  // Filtrage & tri
  const filteredMissions = useMemo(() => {
    let result = [...missions];
    if (statutFiltre !== "Tous") {
      result = result.filter((m) => m.status === statutFiltre);
    }
    if (searchTerm.trim()) {
      result = result.filter((m) =>
        [m.title, m.description, m.city, m.address, m.contactName]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return 0;
      });
    }
    return result;
  }, [missions, statutFiltre, searchTerm, sortBy, sortOrder]);

  const paginatedMissions = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMissions.slice(start, start + rowsPerPage);
  }, [filteredMissions, currentPage]);
  const totalPages = Math.ceil(filteredMissions.length / rowsPerPage);

  const toggleSort = (key: keyof Mission) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const formatDateTime = (dt: string) => {
    return new Date(dt).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  // Gérer la sélection de fichiers
  const handleFilesChange = (
    missionId: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      setFilesByMission((prev) => ({
        ...prev,
        [missionId]: Array.from(files),
      }));
    }
  };

  // Uploader fichiers
  const uploadFiles = async (missionId: number) => {
    const files = filesByMission[missionId];
    if (!files || files.length === 0) {
      alert("Aucun fichier à uploader pour cette mission.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("missionId", missionId.toString());

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        alert("Fichiers uploadés avec succès !");
        // Vider la liste après upload
        setFilesByMission((prev) => ({ ...prev, [missionId]: [] }));
      } else {
        alert("Erreur lors de l'upload des fichiers");
      }
    } catch (err) {
      console.error("Erreur lors de l'upload", err);
      alert("Erreur lors de l'upload");
    }
  };

  // Fonction pour télécharger pièces jointes (exemple supplémentaire)
  const handleDownloadAttachments = (missionId: number) => {
    // à implémenter si nécessaire, selon ton API
  };

  function exportToCSV(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault(); // pour éviter le comportement par défaut si besoin

    if (missions.length === 0) {
      alert("Pas de missions à exporter.");
      return;
    }

    // Colonnes CSV
    const headers = [
      "Titre",
      "Description",
      "Ville",
      "Adresse",
      "Date de montage",
      "Date de démontage",
      "Contact",
      "Statut",
      "transporteur",
    ];

    // Lignes des missions
    const rows = missions.map((mission) => [
      mission.title,
      mission.description,
      mission.city,
      mission.address,
      new Date(mission.setupDateTime).toLocaleString(),
      new Date(mission.teardownDateTime).toLocaleString(),
      `${mission.contactName} (${mission.contactPhone})`,
      mission.status,
      mission.transporteur,
    ]);

    // Construction du CSV : protéger les champs dans des guillemets et gérer les guillemets internes
    const csvContent = [
      headers.join(";"),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(";")
      ),
    ].join("\n");

    // Création et téléchargement
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `missions_export_${new Date().toISOString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`missions-table-page ${darkMode ? "dark" : "light"}`}>
      {/* Navigation et boutons */}
      <div
        style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
        aria-label="Barre de navigation principale"
      >
        {/* ... autres boutons ... */}
        <button
          onClick={() => navigate("/admin")}
          aria-label="Accueil"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#1b9c55",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: "bold",
            border: "none",
            boxShadow: "0 2px 6px rgba(27,156,85,0.5)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#12834d")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#1b9c55")
          }
        >
          🏠 Accueil
        </button>
        {/* ... autre bouton pour ajouter une mission ... */}
        <button
          onClick={() => navigate("/admin")}
          aria-label="Ajouter une mission"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,123,255,0.4)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#007bff")
          }
        >
          ➕ Ajouter une mission
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="header">
        <h1>Missions</h1>
        <div
          className="controls"
          aria-label="Filtres et recherche des missions"
        >
          <input
            type="text"
            placeholder="🔍 Rechercher..."
            aria-label="Recherche missions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            aria-label="Filtrer par statut"
            value={statutFiltre}
            onChange={(e) =>
              setStatutFiltre(e.target.value as (typeof STATUTS)[number])
            }
          >
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            aria-pressed={darkMode}
            aria-label="Basculer mode clair/sombre"
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          {/* Suppose que exportToCSV est défini ailleurs */}
          <button aria-label="Exporter en CSV" onClick={exportToCSV}>
            📤 Export CSV
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div
        className="table-wrapper"
        role="table"
        aria-label="Liste des missions"
      >
        <table>
          <thead>
            <tr>
              {/* Colonnes */}
              <th
                onClick={() => toggleSort("title")}
                tabIndex={0}
                role="button"
                aria-label="Trier par Titre"
              >
                Titre{" "}
                {sortBy === "title" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th>Description</th>
              <th
                onClick={() => toggleSort("city")}
                tabIndex={0}
                role="button"
                aria-label="Trier par Ville"
              >
                Ville{" "}
                {sortBy === "city" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th>Adresse</th>
              <th
                onClick={() => toggleSort("setupDateTime")}
                tabIndex={0}
                role="button"
                aria-label="Trier par date Montage"
              >
                Montage{" "}
                {sortBy === "setupDateTime"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th>Démontage</th>
              <th>Contact</th>
              <th>Intervenant 1</th>
              <th>Intervenant 2</th>
              <th
                onClick={() => toggleSort("status")}
                tabIndex={0}
                role="button"
                aria-label="Trier par Statut"
              >
                Statut{" "}
                {sortBy === "status" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMissions.map((m) => (
              <tr key={m.id}>
                <td>{m.title}</td>
                <td>{m.description}</td>
                <td>{m.city}</td>
                <td>{m.address}</td>
                <td>{formatDateTime(m.setupDateTime)}</td>
                <td>{formatDateTime(m.teardownDateTime)}</td>
                <td>{`${m.contactName} (${m.contactPhone})`}</td>
                <td>{m.intervenant1?.nom || "-"}</td>
                <td>{m.intervenant2?.nom || "-"}</td>
                <td>{m.status}</td>
                {/* Actions avec gestion fichiers */}
                <td style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {/* Bouton Éditer */}
                  <button
                    onClick={() =>
                      navigate("/admin", { state: { missionToEdit: m } })
                    }
                    aria-label={`Éditer la mission ${m.title}`}
                    style={{ backgroundColor: "#2980b9" }}
                  >
                    ✏️ Éditer
                  </button>

                  {/* Bouton Transporteur */}
                  <button
                    aria-label={`Numéro du transporteur ${m.transporteur}`}
                    style={{ backgroundColor: "#27ae60", cursor: "default" }}
                    disabled
                  >
                    🚚 {m.transporteur}
                  </button>

                  {/* Bouton Télécharger pièces jointes */}
                  <button
                    onClick={() => handleDownloadAttachments(m.id)}
                    aria-label={`Télécharger pièces jointes de la mission ${m.title}`}
                    style={{ backgroundColor: "#f39c12" }}
                  >
                    📥 Télécharger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="pagination"
        role="navigation"
        aria-label="Pagination des missions"
      >
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          aria-disabled={currentPage === 1}
          aria-label="Page précédente"
        >
          ⬅️
        </button>
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          aria-disabled={currentPage === totalPages}
          aria-label="Page suivante"
        >
          ➡️
        </button>
      </div>

      {/* Style CSS intégré */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');

        .missions-table-page {
          font-family: 'Poppins', sans-serif;
          padding: 2rem;
          background-color: ${darkMode ? "#1e1e2f" : "#f4f6f8"};
          color: ${darkMode ? "#e0e0e0" : "#222"};
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header h1 {
          font-weight: 700;
          font-size: 2rem;
          color: ${darkMode ? "#7ea4ff" : "#3a77f2"};
          margin: 0;
          user-select: none;
        }

        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        input[type="text"],
        select,
        button {
          padding: 0.65rem 1rem;
          font-size: 1rem;
          border-radius: 8px;
          border: 1px solid ${darkMode ? "#444" : "#ccc"};
          outline: none;
          transition: all 0.3s ease;
          background-color: ${darkMode ? "#2a2a3d" : "#fff"};
          color: ${darkMode ? "#eee" : "#222"};
        }

        input[type="text"]:focus,
        select:focus {
          border-color: #3a77f2;
          box-shadow: 0 0 8px rgba(58, 119, 242, 0.6);
          background-color: ${darkMode ? "#36364f" : "#fff"};
          color: ${darkMode ? "#fff" : "#222"};
        }

        button {
          cursor: pointer;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          font-weight: 600;
          border: none;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          user-select: none;
        }

        button:hover {
          background: linear-gradient(135deg, #5a67d8, #6a1b9a);
          transform: translateY(-2px);
        }

        .table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.1);
          background-color: ${darkMode ? "#2a2a3d" : "#fff"};
          transition: background-color 0.3s ease;
        }

        table {
          width: 100%;
          min-width: 800px;
          border-collapse: separate;
          border-spacing: 0 12px;
          border-radius: 12px;
          overflow: hidden;
        }

        thead tr {
          display: table-row;
          background-color: transparent;
        }

        th {
          background-color: #5a92f2;
          color: #fff;
          cursor: pointer;
          padding: 1rem;
          font-weight: 600;
          font-size: 1rem;
          user-select: none;
          border-radius: 8px;
          transition: background-color 0.3s ease;
        }

        th:hover {
          background-color: #4974e2;
        }

        tbody tr {
          background-color: ${darkMode ? "#36364f" : "#fff"};
          transition: background-color 0.3s ease;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.07);
        }

        tbody tr:nth-child(even) {
          background-color: ${darkMode ? "#2d2d44" : "#f4f6f8"};
        }

        tbody tr:hover {
          background-color: ${darkMode ? "#484868" : "#e0f0ff"};
        }

        td {
          padding: 1rem;
          font-size: 0.95rem;
          border-radius: 8px;
          color: ${darkMode ? "#ddd" : "#333"};
        }

        td button {
          padding: 0.6rem 1rem;
          background: #64b5f6;
          color: #fff;
          border-radius: 8px;
          font-weight: 600;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
          user-select: none;
        }

        td button:hover {
          background: #42a5f5;
          transform: translateY(-1px);
        }

        .pagination {
          margin-top: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          user-select: none;
        }

        .pagination button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          padding: 0.6rem 1.2rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination button:hover:enabled {
          background: linear-gradient(135deg, #5a67d8, #6a1b9a);
          transform: translateY(-2px);
        }

        .pagination button:disabled,
        .pagination button[aria-disabled="true"] {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination span {
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: ${darkMode ? "#ccc" : "#444"};
        }

        /* Scrollbar personnalisé pour table-wrapper */
        .table-wrapper::-webkit-scrollbar {
          height: 8px;
        }

        .table-wrapper::-webkit-scrollbar-track {
          background: ${darkMode ? "#1e1e2f" : "#f1f1f1"};
          border-radius: 8px;
        }

        .table-wrapper::-webkit-scrollbar-thumb {
          background: #5a92f2;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default MissionsTable;

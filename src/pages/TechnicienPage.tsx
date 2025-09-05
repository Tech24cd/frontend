import React, { useState, useEffect } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


type MissionStatus = "non débuté" | "montage" | "démontage" | "terminé";

type Comment = {
  id: number;
  author: string;
  content: string;
  date: string;
};

type Document = {
  id: number;
  name: string;
  url: string;
};

interface User {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
}

type Mission = {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  city: string;
  address: string;
  setupDateTime: string;
  teardownDateTime: string;
  contactName: string;
  contactPhone: string;
  intervenant1?: User | null;
  intervenant2?: User | null;
  comments: Comment[];
  documents: Document[];
};

const TechnicienPage: React.FC = () => {
  const currentTechnicienId = localStorage.getItem("userId") || "";

  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MissionStatus | "">("");
  const [sortAsc, setSortAsc] = useState(true);
  const [newComment, setNewComment] = useState<{ [missionId: string]: string }>(
    {}
  );

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/missions`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const allMissions = await response.json();
        setMissions(allMissions);
        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement missions :", error);
        setError("Erreur lors du chargement des missions");
        setMissions([]);
        setLoading(false);
      }
    };
    fetchMissions();
  }, [currentTechnicienId]);

  const filteredMissions = missions
    .filter((m) => statusFilter === "" || m.status === statusFilter)
    .sort((a, b) =>
      sortAsc
        ? new Date(a.setupDateTime).getTime() -
          new Date(b.setupDateTime).getTime()
        : new Date(b.setupDateTime).getTime() -
          new Date(a.setupDateTime).getTime()
    );

  const formatDateTime = (dt: string) =>
    new Date(dt).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // Fonctions simplifiées (possibilité d'implémenter vraies requêtes backend)
  const updateStatus = (id: string, newStatus: MissionStatus) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
  };

  const addComment = (missionId: string) => {
    const content = newComment[missionId]?.trim();
    if (!content) return alert("Le commentaire est vide");
    const newC: Comment = {
      id: Date.now(),
      author: currentTechnicienId,
      content,
      date: new Date().toISOString(),
    };
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, comments: [...m.comments, newC] } : m
      )
    );
    setNewComment((prev) => ({ ...prev, [missionId]: "" }));
  };

  const deleteComment = (missionId: string, commentId: number) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? { ...m, comments: m.comments.filter((c) => c.id !== commentId) }
          : m
      )
    );
  };

  const addDocument = (missionId: string, file: File) => {
    const url = URL.createObjectURL(file);
    const newDoc: Document = { id: Date.now(), name: file.name, url };
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, documents: [...m.documents, newDoc] } : m
      )
    );
  };

  const deleteDocument = (missionId: string, docId: number) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? { ...m, documents: m.documents.filter((d) => d.id !== docId) }
          : m
      )
    );
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Chargement des missions...
      </p>
    );
  if (error)
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        {error}
      </p>
    );

  return (
    <main
      className="page-container"
      role="main"
      aria-label="Page Technicien - Missions"
    >
      <section className="admin-wrapper" aria-live="polite">
        <h1>Missions assignées à {currentTechnicienId}</h1>

        <form className="filters" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="statusFilter" className="filter-label">
            Filtrer par statut
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as MissionStatus | "")
              }
              aria-controls="missions-list"
            >
              <option value="">Tous</option>
              <option value="non débuté">Non débuté</option>
              <option value="montage">Montage</option>
              <option value="démontage">Démontage</option>
              <option value="terminé">Terminé</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setSortAsc((prev) => !prev)}
            aria-pressed={sortAsc}
          >
            Trier par date {sortAsc ? "↑" : "↓"}
          </button>
        </form>

        {filteredMissions.length === 0 ? (
          <p>Aucune mission assignée pour ce filtre.</p>
        ) : (
          <ul id="missions-list" className="missions-list" role="list">
            {filteredMissions.map((m) => (
              <li
                key={m.id}
                className={`mission mission-${m.status.replace(" ", "-")}`}
              >
                <h2>{m.title}</h2>
                <p>
                  <strong>Description :</strong> {m.description}
                </p>
                <p>
                  <strong>Ville :</strong> {m.city}
                </p>
                <p>
                  <strong>Adresse :</strong> {m.address}
                </p>
                <p>
                  <strong>Montage :</strong> {formatDateTime(m.setupDateTime)}
                </p>
                <p>
                  <strong>Démontage :</strong>{" "}
                  {formatDateTime(m.teardownDateTime)}
                </p>
                <p>
                  <strong>Contact :</strong> {m.contactName} - {m.contactPhone}
                </p>
                <p>
                  <strong>Intervenants :</strong>{" "}
                  {m.intervenant1 ? m.intervenant1.nom : "—"} /{" "}
                  {m.intervenant2 ? m.intervenant2.nom : "—"}
                </p>

                <label>
                  Statut :
                  <select
                    value={m.status}
                    onChange={(e) =>
                      updateStatus(m.id, e.target.value as MissionStatus)
                    }
                    aria-label={`Changer statut mission ${m.title}`}
                  >
                    <option value="non débuté">Non débuté</option>
                    <option value="montage">Montage</option>
                    <option value="démontage">Démontage</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </label>

                <section className="documents">
                  <h3>Documents</h3>
                  {m.documents.length === 0 ? (
                    <p>Aucun document disponible.</p>
                  ) : (
                    <ul>
                      {m.documents.map((doc) => (
                        <li key={doc.id}>
                          <a
                            href={doc.url}
                            download={doc.name}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {doc.name}
                          </a>
                          <button
                            onClick={() => deleteDocument(m.id, doc.id)}
                            aria-label={`Supprimer ${doc.name}`}
                          >
                            Supprimer
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    aria-label={`Ajouter un document à la mission ${m.title}`}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        addDocument(m.id, e.target.files[0]);
                        e.target.value = "";
                      }
                    }}
                  />
                </section>

                <section className="comments">
                  <h3>Commentaires</h3>
                  {m.comments.length === 0 ? (
                    <p>Aucun commentaire.</p>
                  ) : (
                    <ul>
                      {m.comments.map((c) => (
                        <li key={c.id}>
                          <strong>{c.author}</strong> [
                          {new Date(c.date).toLocaleString()}]: {c.content}
                          {c.author === currentTechnicienId && (
                            <button
                              onClick={() => deleteComment(m.id, c.id)}
                              aria-label={`Supprimer commentaire de ${c.author}`}
                            >
                              Supprimer
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <textarea
                    value={newComment[m.id] || ""}
                    placeholder="Ajouter un commentaire..."
                    rows={3}
                    aria-label={`Nouveau commentaire pour la mission ${m.title}`}
                    onChange={(e) =>
                      setNewComment((prev) => ({
                        ...prev,
                        [m.id]: e.target.value,
                      }))
                    }
                  />
                  <button onClick={() => addComment(m.id)}>Ajouter</button>
                </section>
              </li>
            ))}
          </ul>
        )}
      </section>

      <style>{`
        /* --- Style professionnel et clair --- */
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
        }
        .admin-wrapper {
          background: var(--color-card-bg);
          padding: 2rem 2.5rem;
          border-radius: var(--radius);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          max-width: 900px;
          width: 100%;
        }
        h1 {
          font-size: 2.5rem;
          color: var(--color-primary);
          margin-bottom: 1.5rem;
          user-select: none;
          text-align: center;
        }
        .filters {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .filter-label {
          font-weight: 600;
          font-size: 1rem;
          color: var(--color-muted);
          display: flex;
          flex-direction: column;
        }
        select {
          margin-top: 0.3rem;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 1rem;
          cursor: pointer;
          min-width: 140px;
          transition: border-color 0.3s;
        }
        select:hover,
        select:focus {
          border-color: var(--color-primary);
          outline: none;
        }
        button {
          background-color: var(--color-primary);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        button:hover,
        button:focus {
          background-color: var(--color-primary-hover);
          outline: none;
        }
        .missions-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .mission {
          background: var(--color-card-bg);
          border-radius: var(--radius);
          box-shadow: 0 4px 12px rgb(0 0 0 / 0.05);
          padding: 1.5rem;
          margin-bottom: 2rem;
          transition: box-shadow 0.3s ease;
        }
        .mission:hover {
          box-shadow: 0 6px 20px rgb(0 0 0 / 0.1);
        }
        .mission h2 {
          margin-top: 0;
          color: var(--color-primary);
        }
        label {
          display: block;
          margin: 0.6rem 0 0.2rem;
          font-weight: 600;
          user-select: none;
        }
        textarea {
          width: 100%;
          resize: vertical;
          border-radius: 6px;
          border: 1px solid #ccc;
          padding: 0.6rem;
          font-size: 1rem;
          color: var(--color-text);
          font-family: var(--font-family);
          margin-top: 0.2rem;
        }
        input[type="file"] {
          margin-top: 0.5rem;
        }
        .documents ul,
        .comments ul {
          padding-left: 1.2rem;
          margin-top: 0.25rem;
        }
        .documents li,
        .comments li {
          margin-bottom: 0.4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .documents a {
          color: var(--color-primary);
          font-weight: 600;
          text-decoration: none;
        }
        .documents a:hover,
        .documents a:focus {
          text-decoration: underline;
        }
        .documents button,
        .comments button {
          background: transparent;
          border: none;
          color: #e74c3c;
          cursor: pointer;
          font-weight: 600;
          padding-left: 10px;
          user-select: none;
        }
        .documents button:hover,
        .comments button:hover {
          text-decoration: underline;
          outline: none;
        }
        .comments li strong {
          margin-right: 6px;
        }

        /* Codes couleur bordures selon statut */
        .mission-non-débuté {
          border-left: 5px solid #f39c12;
        }
        .mission-montage {
          border-left: 5px solid #2980b9;
        }
        .mission-démontage {
          border-left: 5px solid #8e44ad;
        }
        .mission-terminé {
          border-left: 5px solid #27ae60;
          opacity: 0.85;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .filters {
            flex-direction: column;
            align-items: stretch;
          }
          select, button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
};

export default TechnicienPage;

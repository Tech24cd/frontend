import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

type Intervenant = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
};

type UserFromBackend = {
  id: string;
  nom: string;
  email: string;
  telephone: string;
};

type Mission = {
  [x: string]: any;
  transporteur: string;
  id: number;
  title: string;
  description: string;
  status:
    | "en attente"
    | "Validé"
    | "Refusé"
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
  Documents?: Document[]; // Ici on utilise notre type Document
};

type Document = {
  id: string;
  filename: string;
  path: string;
  url?: string; // propriété virtuelle de ton modèle Sequelize
  mimetype?: string;
  size?: number;
  uploadDate?: string;
};

const AdminPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [intervenantsList, setIntervenantsList] = useState<Intervenant[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<Mission["status"]>("en attente");
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [setupDateTime, setSetupDateTime] = useState<string>("");
  const [teardownDateTime, setTeardownDateTime] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [intervenant1Id, setIntervenant1Id] = useState<string>("");
  const [intervenant2Id, setIntervenant2Id] = useState<string>("");
  const [transporteur, setTransporteur] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [prestataireId, setPrestataireId] = useState<string>("");
  const [prestatairesList, setPrestatairesList] = useState<UserFromBackend[]>(
    []
  );

  // Nouvel état pour les fichiers (max 3)
  const [files, setFiles] = useState<File[]>([]);

  type LocationState = {
    missionToEdit?: Mission;
  };

  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const missionFromState = state?.missionToEdit;

  useEffect(() => {
    if (missionFromState) {
      startEditing(missionFromState);
      window.history.replaceState({}, document.title);
    }
  }, [missionFromState]);

  // Chargement techniciens
  useEffect(() => {
    fetch("${API_BASE_URL}/api/users/techniciens``)
      .then((res) => res.json())
      .then((data: UserFromBackend[]) => {
        const techniciens = data.map((user) => ({
          id: user.id,
          nom: user.nom,
          email: user.email,
          telephone: user.telephone,
        }));
        setIntervenantsList(techniciens);
      })
      .catch((err) => console.error("Erreur chargement techniciens", err));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/prestataires`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: UserFromBackend[]) => {
        setPrestatairesList(data);
      })
      .catch((err) => console.error("Erreur chargement prestataires", err));
  }, []);
  // Chargement missions
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/missions/admin`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Non autorisé");
        return res.json();
      })
      .then((data: Mission[]) => {
        console.log("Missions reçues :", data);
        setMissions(data);
      })
      .catch((err) => console.error("Erreur chargement missions (admin)", err));
  }, []);

  const formatDateTime = (dt: string) => {
    const date = new Date(dt);
    return date.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("en attente");
    setCity("");
    setAddress("");
    setSetupDateTime("");
    setTeardownDateTime("");
    setContactName("");
    setContactPhone("");

    setIntervenant1Id("");
    setIntervenant2Id("");
    setTransporteur("");
    setFiles([]); // reset des fichiers
  };

  const startEditing = (mission: Mission) => {
    setEditingId(mission.id);
    setTitle(mission.title);
    setDescription(mission.description);
    setStatus(mission.status);
    setCity(mission.city);
    setAddress(mission.address);
    setSetupDateTime(mission.setupDateTime);
    setTeardownDateTime(mission.teardownDateTime);
    setContactName(mission.contactName);
    setContactPhone(mission.contactPhone);

    setIntervenant1Id(mission.intervenant1?.id ?? "");
    setIntervenant2Id(mission.intervenant2?.id ?? "");
    setTransporteur(mission.transporteur || "");
    setFiles([]); // pas de pré-remplissage des fichiers
  };

  const sendNotification = async (mission: Mission) => {
    try {
      // Préparer les emails des intervenants
      const emails = [
        mission.intervenant1?.email,
        mission.intervenant2?.email,
      ].filter(Boolean) as string[];

      if (emails.length === 0) {
        alert("Cette mission n'a pas d'intervenants avec email.");
        return;
      }

      // Requête vers ton API backend pour envoyer le mail
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/send-mission`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // si besoin d’auth
          body: JSON.stringify({
            missionId: mission.id,
            emails,
            missionTitle: mission.title,
            missionDescription: mission.description,
            missionStartDate: mission.setupDateTime,
            missionEndDate: mission.teardownDateTime,
          }),
        }
      );

      if (response.ok) {
        alert("Notification envoyée avec succès !");
      } else {
        const text = await response.text();
        throw new Error(text || "Erreur serveur");
      }
    } catch (err: any) {
      alert("Erreur lors de l'envoi de la notification : " + err.message);
      console.error(err);
    }
  };

  const saveMission = () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !city.trim() ||
      !address.trim() ||
      !setupDateTime ||
      !teardownDateTime ||
      !contactName.trim() ||
      !contactPhone.trim()
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (intervenant1Id && intervenant2Id && intervenant1Id === intervenant2Id) {
      alert("Veuillez choisir deux intervenants différents");
      return;
    }

    // Créer FormData
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("status", status);
    formData.append("city", city);
    formData.append("address", address);
    formData.append("setupDateTime", setupDateTime);
    formData.append("teardownDateTime", teardownDateTime);
    formData.append("contactName", contactName);
    formData.append("contactPhone", contactPhone);
    formData.append("prestataireId", prestataireId);
    formData.append("intervenant1Id", intervenant1Id || "");
    formData.append("intervenant2Id", intervenant2Id || "");
    formData.append("transporteur", transporteur);

    if (files && files.length > 0) {
      for (let i = 0; i < files.length && i < 3; i++) {
        formData.append("files", files[i]); // **ici : "files" au lieu de "documents"**
      }
    }

    const url =
      editingId === null
        ? `${API_BASE_URL}/api/missions`
        : `${API_BASE_URL}/api/missions/${editingId}`;
    const method = editingId === null ? "POST" : "PUT";

    fetch(url, {
      method,
      credentials: "include",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`Erreur serveur : ${res.status} - ${text}`);
          });
        }
        return res.json();
      })
      .then((mission: Mission) => {
        if (editingId === null) {
          setMissions((prev) => [...prev, mission]);
        } else {
          setMissions((prev) =>
            prev.map((m) => (m.id === mission.id ? mission : m))
          );
        }
        resetForm();
      })
      .catch((err) =>
        alert(`Erreur ajout/mise à jour mission : ${err.message}`)
      );
  };

  const deleteMission = (id: number) => {
    if (!window.confirm("Supprimer cette mission ?")) return;
    fetch(`${API_BASE_URL}/api/missions/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setMissions((prev) => prev.filter((m) => m.id !== id));
        if (editingId === id) resetForm();
      })
      .catch((err) => console.error("Erreur suppression mission", err));
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Gestionnaire pour changement de fichiers (max 3)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3); // max 3
      setFiles(selectedFiles);
    }
  };

  return (
    <div className={`page-container ${darkMode ? "dark" : "light"}`}>
      {/* Bouton thème */}
      <button className="toggle-theme" onClick={toggleDarkMode}>
        {darkMode ? "🌞" : "🌙"}
      </button>

      {/* Navigation */}
      <nav style={{ position: "fixed", top: "1rem", left: "1rem" }}>
        <Link
          to="/table"
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
          to="/planning"
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
        <Link
          to="/Cardpay"
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
          🧾 Facturation
        </Link>
      </nav>

      {/* Contenu principal */}
      <div className="admin-wrapper">
        <h1>Gestion des Missions</h1>

        {/* Formulaire */}
        <section className="mission-form">
          <h2>
            {editingId === null ? "Ajouter une mission" : "Modifier la mission"}
          </h2>

          {/* Input Titre */}
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Textarea Description */}
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Ville */}
          <input
            type="text"
            placeholder="Ville"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          {/* Adresse */}
          <input
            type="text"
            placeholder="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* Dates */}
          <label>
            Date & heure de montage
            <input
              type="datetime-local"
              value={setupDateTime}
              onChange={(e) => setSetupDateTime(e.target.value)}
            />
          </label>

          <label>
            Date & heure de démontage
            <input
              type="datetime-local"
              value={teardownDateTime}
              onChange={(e) => setTeardownDateTime(e.target.value)}
            />
          </label>
          <p>Test d’affichage du select</p>
          <label>
            Prestataire
            <select
              value={prestataireId}
              onChange={(e) => setPrestataireId(e.target.value)}
            >
              <option value="">-- Aucun --</option>
              {prestatairesList.map((prestataire) => (
                <option key={prestataire.id} value={prestataire.id}>
                  {prestataire.nom}
                </option>
              ))}
            </select>
          </label>

          {/* Contact */}
          <input
            type="text"
            placeholder="Nom du contact"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Téléphone du contact"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />

          {/* Intervenants */}
          <label>
            Intervenant 1
            <select
              value={intervenant1Id}
              onChange={(e) => setIntervenant1Id(e.target.value)}
            >
              <option value="">-- Aucun --</option>
              {intervenantsList.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nom}
                </option>
              ))}
            </select>
          </label>

          <label>
            Intervenant 2
            <select
              value={intervenant2Id}
              onChange={(e) => setIntervenant2Id(e.target.value)}
            >
              <option value="">-- Aucun --</option>
              {intervenantsList.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nom}
                </option>
              ))}
            </select>
          </label>

          {/* Transporteur */}
          <input
            type="text"
            placeholder="Numéro du camion / Transporteur"
            value={transporteur}
            onChange={(e) => setTransporteur(e.target.value)}
          />

          {/* Fichiers */}
          <label>
            Documents (max 3)
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
            />
          </label>

          {/* Statut */}
          <label>
            Statut
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Mission["status"])}
            >
              <option value="en attente">En attente</option>
              <option value="Validé">Validé</option>
              <option value="Refusé">Refusé</option>
              <option value="non débuté">Non débuté</option>
              <option value="montage">Montage</option>
              <option value="démontage">Démontage</option>
              <option value="terminé">Terminé</option>
            </select>
          </label>

          {/* Boutons */}
          <button onClick={saveMission}>
            {editingId === null ? "Ajouter" : "Enregistrer"}
          </button>
          {editingId !== null && <button onClick={resetForm}>Annuler</button>}
        </section>

        {/* Liste des missions */}
        <section className="missions-list">
          <h2>Liste des missions</h2>
          {missions.length === 0 ? (
            <p>Aucune mission pour le moment.</p>
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
                    <strong>Prestataire :</strong> {m.prestataire?.nom ?? "-"}
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
                                doc.url ?? `${API_BASE_URL}${doc.path}`
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

                  <button
                    onClick={() => sendNotification(m)}
                    aria-label={`Envoyer notification pour la mission ${m.title}`}
                    style={{
                      backgroundColor: "#007bff",
                      color: "#fff",
                      marginLeft: "-1px",
                    }}
                  >
                    📩 Envoyer une notification
                  </button>

                  {/* Modifier et supprimer */}
                  <div>
                    <button onClick={() => startEditing(m)}>Modifier</button>
                    <button
                      onClick={() => deleteMission(m.id)}
                      style={{
                        backgroundColor: "#f44336",
                        color: "#fff",
                        marginLeft: 8,
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
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

        .admin-wrapper {
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
        .page-container.light .admin-wrapper {
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

        input, textarea, select {
          width: 100%;
          margin-bottom: 12px;
          padding: 8px 12px;
          font-size: 1rem;
          border-radius: 6px;
          border: 1px solid #666;
          background: transparent;
          color: inherit;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .page-container.light input,
        .page-container.light textarea,
        .page-container.light select {
          background: #fff;
          border: 1px solid #ccc;
          color: #222;
        }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: var(--color-primary);
          background: rgba(255 255 255 / 0.1);
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        button {
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          padding: 10px 15px;
          border-radius: 8px;
          border: none;
          background-color: var(--color-primary);
          color: white;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: var(--color-primary-hover);
        }

        .missions-list ul {
          list-style: none;
          padding-left: 0;
        }

        .mission {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          background: rgba(255 255 255 / 0.05);
          box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
        }
        .mission-en-cours {
          border-left: 4px solid #03c04a;
        }
        .mission-terminée {
          border-left: 4px solid #0096c7;
          opacity: 0.8;
        }
        .mission-en-attente {
          border-left: 4px solid #f4a261;
          opacity: 0.9;
        }

        .mission label {
          display: inline-block;
          margin-top: 8px;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default AdminPage;

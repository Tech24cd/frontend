import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
const AdminPage = () => {
  const [missions, setMissions] = useState([]);
  const [intervenantsList, setIntervenantsList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("en attente");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [setupDateTime, setSetupDateTime] = useState("");
  const [teardownDateTime, setTeardownDateTime] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [prestatairesList, setPrestatairesList] = useState([]);
  const [intervenant1Id, setIntervenant1Id] = useState("");
  const [intervenant2Id, setIntervenant2Id] = useState("");
  const [transporteur, setTransporteur] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  // Nouvel état pour les fichiers (max 3)
  const [files, setFiles] = useState([]);
  const location = useLocation();
  const state = location.state;
  const missionFromState = state?.missionToEdit;
  useEffect(() => {
    if (missionFromState) {
      startEditing(missionFromState);
      window.history.replaceState({}, document.title);
    }
  }, [missionFromState]);
  // Chargement techniciens
  useEffect(() => {
    fetch("http://localhost:3000/api/users/techniciens")
      .then((res) => res.json())
      .then((data) => {
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
  // Chargement missions
  useEffect(() => {
    fetch("http://localhost:3000/api/missions/admin", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Non autorisé");
        return res.json();
      })
      .then((data) => {
        console.log("Missions reçues :", data);
        setMissions(data);
      })
      .catch((err) => console.error("Erreur chargement missions (admin)", err));
  }, []);
  const formatDateTime = (dt) => {
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
  const startEditing = (mission) => {
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
  const sendNotification = async (mission) => {
    try {
      // Préparer les emails des intervenants
      const emails = [
        mission.intervenant1?.email,
        mission.intervenant2?.email,
      ].filter(Boolean);
      if (emails.length === 0) {
        alert("Cette mission n'a pas d'intervenants avec email.");
        return;
      }
      // Requête vers ton API backend pour envoyer le mail
      const response = await fetch(
        "http://localhost:3000/api/notifications/send-mission",
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
    } catch (err) {
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
        ? "http://localhost:3000/api/missions"
        : `http://localhost:3000/api/missions/${editingId}`;
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
      .then((mission) => {
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
  const deleteMission = (id) => {
    if (!window.confirm("Supprimer cette mission ?")) return;
    fetch(`http://localhost:3000/api/missions/${id}`, {
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
  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3); // max 3
      setFiles(selectedFiles);
    }
  };
  return _jsxs("div", {
    className: `page-container ${darkMode ? "dark" : "light"}`,
    children: [
      _jsx("button", {
        className: "toggle-theme",
        onClick: toggleDarkMode,
        children: darkMode ? "🌞" : "🌙",
      }),
      _jsxs("nav", {
        style: { position: "fixed", top: "1rem", left: "1rem" },
        children: [
          _jsx(Link, {
            to: "/table",
            style: {
              padding: "0.5rem 1rem",
              background: "var(--color-primary)",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
            },
            children: "\uD83E\uDDE9 Tableau",
          }),
          _jsx(Link, {
            to: "/planning",
            style: {
              padding: "0.5rem 1rem",
              background: "var(--color-primary)",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              marginLeft: "1rem",
            },
            children: "\uD83D\uDCC5 Planning",
          }),
          _jsx(Link, {
            to: "/Cardpay",
            style: {
              padding: "0.5rem 1rem",
              background: "var(--color-primary)",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              marginLeft: "1rem",
            },
            children: "\uD83E\uDDFE Facturation",
          }),
        ],
      }),
      _jsxs("div", {
        className: "admin-wrapper",
        children: [
          _jsx("h1", { children: "Gestion des Missions" }),
          _jsxs("section", {
            className: "mission-form",
            children: [
              _jsx("h2", {
                children:
                  editingId === null
                    ? "Ajouter une mission"
                    : "Modifier la mission",
              }),
              _jsx("input", {
                type: "text",
                placeholder: "Titre",
                value: title,
                onChange: (e) => setTitle(e.target.value),
              }),
              _jsx("textarea", {
                placeholder: "Description",
                value: description,
                onChange: (e) => setDescription(e.target.value),
              }),
              _jsx("input", {
                type: "text",
                placeholder: "Ville",
                value: city,
                onChange: (e) => setCity(e.target.value),
              }),
              _jsx("input", {
                type: "text",
                placeholder: "Adresse",
                value: address,
                onChange: (e) => setAddress(e.target.value),
              }),
              _jsxs("label", {
                children: [
                  "Date & heure de montage",
                  _jsx("input", {
                    type: "datetime-local",
                    value: setupDateTime,
                    onChange: (e) => setSetupDateTime(e.target.value),
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Date & heure de d\u00E9montage",
                  _jsx("input", {
                    type: "datetime-local",
                    value: teardownDateTime,
                    onChange: (e) => setTeardownDateTime(e.target.value),
                  }),
                ],
              }),
              _jsx("input", {
                type: "text",
                placeholder: "Nom du contact",
                value: contactName,
                onChange: (e) => setContactName(e.target.value),
              }),
              _jsx("input", {
                type: "tel",
                placeholder: "T\u00E9l\u00E9phone du contact",
                value: contactPhone,
                onChange: (e) => setContactPhone(e.target.value),
              }),
              _jsxs("label", {
                children: [
                  "Intervenant 1",
                  _jsxs("select", {
                    value: intervenant1Id,
                    onChange: (e) => setIntervenant1Id(e.target.value),
                    children: [
                      _jsx("option", { value: "", children: "-- Aucun --" }),
                      intervenantsList.map((i) =>
                        _jsx("option", { value: i.id, children: i.nom }, i.id)
                      ),
                    ],
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Intervenant 2",
                  _jsxs("select", {
                    value: intervenant2Id,
                    onChange: (e) => setIntervenant2Id(e.target.value),
                    children: [
                      _jsx("option", { value: "", children: "-- Aucun --" }),
                      intervenantsList.map((i) =>
                        _jsx("option", { value: i.id, children: i.nom }, i.id)
                      ),
                    ],
                  }),
                ],
              }),
              _jsx("input", {
                type: "text",
                placeholder: "Num\u00E9ro du camion / Transporteur",
                value: transporteur,
                onChange: (e) => setTransporteur(e.target.value),
              }),
              _jsxs("label", {
                children: [
                  "Documents (max 3)",
                  _jsx("input", {
                    type: "file",
                    multiple: true,
                    accept: ".jpg,.jpeg,.png,.pdf",
                    onChange: handleFileChange,
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Statut",
                  _jsxs("select", {
                    value: status,
                    onChange: (e) => setStatus(e.target.value),
                    children: [
                      _jsx("option", {
                        value: "en attente",
                        children: "En attente",
                      }),
                      _jsx("option", {
                        value: "Valid\u00E9",
                        children: "Valid\u00E9",
                      }),
                      _jsx("option", {
                        value: "Refus\u00E9",
                        children: "Refus\u00E9",
                      }),
                      _jsx("option", {
                        value: "non d\u00E9but\u00E9",
                        children: "Non d\u00E9but\u00E9",
                      }),
                      _jsx("option", { value: "montage", children: "Montage" }),
                      _jsx("option", {
                        value: "d\u00E9montage",
                        children: "D\u00E9montage",
                      }),
                      _jsx("option", {
                        value: "termin\u00E9",
                        children: "Termin\u00E9",
                      }),
                    ],
                  }),
                ],
              }),
              _jsx("button", {
                onClick: saveMission,
                children: editingId === null ? "Ajouter" : "Enregistrer",
              }),
              editingId !== null &&
                _jsx("button", { onClick: resetForm, children: "Annuler" }),
            ],
          }),
          _jsxs("section", {
            className: "missions-list",
            children: [
              _jsx("h2", { children: "Liste des missions" }),
              missions.length === 0
                ? _jsx("p", { children: "Aucune mission pour le moment." })
                : _jsx("ul", {
                    children: missions.map((m) =>
                      _jsxs(
                        "li",
                        {
                          children: [
                            _jsx("h3", { children: m.title }),
                            _jsx("p", { children: m.description }),
                            _jsxs("p", {
                              children: [
                                _jsx("strong", { children: "Ville:" }),
                                " ",
                                m.city,
                              ],
                            }),
                            _jsxs("p", {
                              children: [
                                _jsx("strong", { children: "Adresse:" }),
                                " ",
                                m.address,
                              ],
                            }),
                            _jsxs("p", {
                              children: [
                                _jsx("strong", { children: "Montage:" }),
                                " ",
                                formatDateTime(m.setupDateTime),
                              ],
                            }),
                            _jsxs("p", {
                              children: [
                                _jsx("strong", { children: "D\u00E9montage:" }),
                                " ",
                                formatDateTime(m.teardownDateTime),
                              ],
                            }),
                            _jsxs("p", {
                              children: [
                                _jsx("strong", { children: "Contact:" }),
                                " ",
                                m.contactName,
                                " - ",
                                m.contactPhone,
                              ],
                            }),
                            _jsxs("p", {
                              children: [
                                _jsx("strong", { children: "Intervenant 1:" }),
                                " ",
                                m.intervenant1
                                  ? `${m.intervenant1.nom} (${m.intervenant1.email} - ${m.intervenant1.telephone})`
                                  : "-",
                              ],
                            }),
                            _jsxs("p", {
                              children: [
                                _jsx("strong", { children: "Intervenant 2:" }),
                                " ",
                                m.intervenant2
                                  ? `${m.intervenant2.nom} (${m.intervenant2.email} - ${m.intervenant2.telephone})`
                                  : "-",
                              ],
                            }),
                            _jsxs("p", {
                              children: [
                                _jsx("strong", { children: "Transporteur:" }),
                                " ",
                                m.transporteur || "-",
                              ],
                            }),
                            _jsxs("div", {
                              children: [
                                _jsx("strong", {
                                  children: "Documents li\u00E9s :",
                                }),
                                m.Documents && m.Documents.length > 0
                                  ? _jsx("ul", {
                                      children: m.Documents.map((doc) =>
                                        _jsx(
                                          "li",
                                          {
                                            children: _jsxs("a", {
                                              href:
                                                doc.url ??
                                                `http://localhost:3000${doc.path}`,
                                              target: "_blank",
                                              rel: "noopener noreferrer",
                                              children: [
                                                "\uD83D\uDCCE ",
                                                doc.filename,
                                              ],
                                            }),
                                          },
                                          doc.id
                                        )
                                      ),
                                    })
                                  : _jsx("p", { children: "Aucun document" }),
                              ],
                            }),
                            _jsxs("p", {
                              children: [
                                _jsx("strong", { children: "Statut :" }),
                                " ",
                                m.status,
                              ],
                            }),
                            _jsx("button", {
                              onClick: () => sendNotification(m),
                              "aria-label": `Envoyer notification pour la mission ${m.title}`,
                              style: {
                                backgroundColor: "#007bff",
                                color: "#fff",
                                marginLeft: "-1px",
                              },
                              children: "\uD83D\uDCE9 Envoyer une notification",
                            }),
                            _jsxs("div", {
                              children: [
                                _jsx("button", {
                                  onClick: () => startEditing(m),
                                  children: "Modifier",
                                }),
                                _jsx("button", {
                                  onClick: () => deleteMission(m.id),
                                  style: {
                                    backgroundColor: "#f44336",
                                    color: "#fff",
                                    marginLeft: 8,
                                  },
                                  children: "Supprimer",
                                }),
                              ],
                            }),
                          ],
                        },
                        m.id
                      )
                    ),
                  }),
            ],
          }),
        ],
      }),
      _jsx("style", {
        children: `
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
      `,
      }),
    ],
  });
};
export default AdminPage;

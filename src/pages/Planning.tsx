import React, { useEffect, useState, useCallback } from "react";
import { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { useNavigate } from "react-router-dom";

type Mission = {
  id: number;
  title: string;
  description: string;
  status: "en attente" | "non débuté" | "montage" | "démontage" | "terminé";
  city: string;
  address: string;
  setupDateTime: string;
  teardownDateTime: string;
  contactName: string;
  contactPhone: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    mission: Mission;
  };
};

const Planning: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [editMission, setEditMission] = useState<Mission | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();

  // Définir la fonction getColorByStatus
  const getColorByStatus = (status: string) => {
    switch (status) {
      case "en attente":
        return "#f39c12"; // orange
      case "non débuté":
        return "#3498db"; // bleu
      case "montage":
        return "#2ecc71"; // vert
      case "démontage":
        return "#e67e22"; // orange foncé
      case "terminé":
        return "#95a5a6"; // gris
      default:
        return "#7f8c8d"; // gris foncé
    }
  };

  // Déclarer updateEvents en premier
  const updateEvents = useCallback((missionsData: Mission[]) => {
    const evts = missionsData.map((m) => ({
      id: m.id.toString(),
      title: m.title,
      start: m.setupDateTime,
      end: m.teardownDateTime,
      backgroundColor: getColorByStatus(m.status),
      borderColor: getColorByStatus(m.status),
      extendedProps: { mission: m },
    }));
    setEvents(evts);
  }, []);

  // Puis, fetchMissions, sans dépendance sur updateEvents (car utilisé en conjonction avec useCallback)
  const fetchMissions = useCallback(() => {
    fetch("http://localhost:3000/api/missions/admin", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: Mission[]) => {
        setMissions(data);
        updateEvents(data);
      })
      .catch(console.error);
  }, [updateEvents]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // Fonction pour ajouter une mission
  const handleDateSelect = (
    selectInfo: DateSelectArg & { startStr: string; endStr: string }
  ) => {
    const titre = prompt("Nom de la mission à ajouter ?");
    if (titre) {
      const newMission: Mission = {
        id: Date.now(),
        title: titre,
        description: "",
        status: "non débuté",
        city: "Inconnue",
        address: "",
        setupDateTime: selectInfo.startStr,
        teardownDateTime: selectInfo.endStr,
        contactName: "",
        contactPhone: "",
      };
      const updatedMissions = [...missions, newMission];
      setMissions(updatedMissions);
      updateEvents(updatedMissions);
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const id = parseInt(dropInfo.event.id);
    const missionIndex = missions.findIndex((m) => m.id === id);
    if (missionIndex !== -1) {
      const updatedMission = { ...missions[missionIndex] };
      updatedMission.setupDateTime = dropInfo.event.start?.toISOString() || "";
      updatedMission.teardownDateTime = dropInfo.event.end?.toISOString() || "";
      const newMissions = [...missions];
      newMissions[missionIndex] = updatedMission;
      setMissions(newMissions);
      updateEvents(newMissions);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const mission: Mission = clickInfo.event.extendedProps.mission;
    setEditMission(mission);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (editMission) {
      const filteredMissions = missions.filter((m) => m.id !== editMission.id);
      setMissions(filteredMissions);
      updateEvents(filteredMissions);
      setShowModal(false);
    }
  };

  const handleSave = () => {
    if (editMission) {
      const index = missions.findIndex((m) => m.id === editMission.id);
      if (index !== -1) {
        const newMissions = [...missions];
        newMissions[index] = editMission;
        setMissions(newMissions);
        updateEvents(newMissions);
        setShowModal(false);
      }
    }
  };

  // Optionnel : Type pour rendre le formulaire plus strict
  type EditableMission = Partial<Mission>;

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      {/* 3. bouton juste ici, avant le titre */}
      <div style={{ paddingBottom: "1rem", textAlign: "center" }}>
        <button
          onClick={() => navigate("/admin")}
          style={{
            backgroundColor: "#1b9c55",
            color: "white",
            fontWeight: "bold",
            fontSize: "1rem",
            padding: "0.5rem 1.2rem",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            userSelect: "none",
            boxShadow: "0 3px 8px rgba(27,156,85,0.5)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#159944")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#1b9c55")
          }
          aria-label="Retour à l'accueil"
        >
          🏠 Accueil
        </button>
      </div>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#3a77f2",
          fontFamily: "'Helvetica Neue', sans-serif",
        }}
      >
        🗓️ Planning des Missions
      </h1>

      {/* Calendrier */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        selectable={true}
        editable={true}
        eventDrop={handleEventDrop}
        select={handleDateSelect}
        events={events}
        eventClick={handleEventClick}
        height="80vh"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        customButtons={{
          myCustomButton: {
            text: "Ajouter une Mission",
            click: () => {
              const dateStr = prompt("Entrez la date de début (YYYY-MM-DD)");
              if (dateStr) {
                handleDateSelect({
                  startStr: dateStr + "T09:00:00",
                  endStr: dateStr + "T17:00:00",
                  jsEvent: new Event("click"),
                  view: null,
                  allDay: false,
                  start: new Date(dateStr + "T09:00:00"),
                  end: new Date(dateStr + "T17:00:00"),
                } as unknown as DateSelectArg & { startStr: string; endStr: string });
              }
            },
          },
        }}
      />

      {/* Modal d’édition */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "12px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {editMission && (
              <>
                <h2 style={{ marginBottom: "1rem" }}>Édition de la Mission</h2>
                {[
                  { label: "Titre", field: "title" },
                  {
                    label: "Description",
                    field: "description",
                    type: "textarea",
                  },
                  {
                    label: "Statut",
                    field: "status",
                    type: "select",
                    options: [
                      "en attente",
                      "non débuté",
                      "montage",
                      "démontage",
                      "terminé",
                    ],
                  },
                  { label: "Ville", field: "city" },
                  { label: "Adresse", field: "address" },
                ].map((item, index) => (
                  <div key={index} style={{ marginBottom: "8px" }}>
                    <label style={{ display: "block", marginBottom: "4px" }}>
                      {item.label}
                    </label>
                    {item.type === "textarea" ? (
                      <textarea
                        style={{ width: "100%", height: "60px" }}
                        value={
                          (editMission as EditableMission)[
                            item.field as keyof EditableMission
                          ] || ""
                        }
                        onChange={(e) =>
                          setEditMission({
                            ...editMission,
                            [item.field]: e.target.value,
                          } as Mission)
                        }
                      />
                    ) : item.field === "status" ? (
                      <select
                        style={{ width: "100%" }}
                        value={
                          (editMission as EditableMission)[
                            item.field as keyof EditableMission
                          ] || ""
                        }
                        onChange={(e) =>
                          setEditMission({
                            ...editMission,
                            [item.field]: e.target.value,
                          } as Mission)
                        }
                      >
                        {item.options!.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        style={{ width: "100%" }}
                        type="text"
                        value={
                          (editMission as EditableMission)[
                            item.field as keyof EditableMission
                          ] || ""
                        }
                        onChange={(e) =>
                          setEditMission({
                            ...editMission,
                            [item.field]: e.target.value,
                          } as Mission)
                        }
                      />
                    )}
                  </div>
                ))}

                {/* Boutons */}
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <button
                    onClick={handleSave}
                    style={{ backgroundColor: "#27ae60", color: "white" }}
                  >
                    Sauver
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{ backgroundColor: "#cccccc" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{ backgroundColor: "#e74c3c", color: "white" }}
                  >
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Styles personnalisés */}
      <style>{`
        .fc-header-toolbar {
          background: #fff;
          border-radius: 12px;
          padding: 0.5rem 1rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        button {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default Planning;

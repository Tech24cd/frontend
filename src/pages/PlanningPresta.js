import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { useNavigate } from "react-router-dom";
const Planning = () => {
    const [missions, setMissions] = useState([]);
    const [events, setEvents] = useState([]);
    const [editMission, setEditMission] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    // Définir la fonction getColorByStatus
    const getColorByStatus = (status) => {
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
    const updateEvents = useCallback((missionsData) => {
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
        fetch("http://localhost:3000/api/missions/prestataire", {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
            setMissions(data);
            updateEvents(data);
        })
            .catch(console.error);
    }, [updateEvents]);
    useEffect(() => {
        fetchMissions();
    }, [fetchMissions]);
    // Fonction pour ajouter une mission
    const handleDateSelect = (selectInfo) => {
        const titre = prompt("Nom de la mission à ajouter ?");
        if (titre) {
            const newMission = {
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
    const handleEventDrop = (dropInfo) => {
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
    const handleEventClick = (clickInfo) => {
        const mission = clickInfo.event.extendedProps.mission;
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
    return (_jsxs("div", { style: {
            padding: "2rem",
            backgroundColor: "#f4f6f8",
            minHeight: "100vh",
        }, children: [_jsx("div", { style: { paddingBottom: "1rem", textAlign: "center" }, children: _jsx("button", { onClick: () => navigate("/prestataire"), style: {
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
                    }, onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = "#159944"), onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = "#1b9c55"), "aria-label": "Retour \u00E0 l'accueil", children: "\uD83C\uDFE0 Accueil" }) }), _jsx("h1", { style: {
                    textAlign: "center",
                    marginBottom: "1.5rem",
                    color: "#3a77f2",
                    fontFamily: "'Helvetica Neue', sans-serif",
                }, children: "\uD83D\uDDD3\uFE0F Planning des Missions" }), _jsx(FullCalendar, { plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin], initialView: "dayGridMonth", locale: frLocale, selectable: true, editable: true, eventDrop: handleEventDrop, select: handleDateSelect, events: events, eventClick: handleEventClick, height: "80vh", headerToolbar: {
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }, customButtons: {
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
                                });
                            }
                        },
                    },
                } }), showModal && (_jsx("div", { style: {
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
                }, children: _jsx("div", { style: {
                        backgroundColor: "#fff",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        width: "400px",
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }, children: editMission && (_jsxs(_Fragment, { children: [_jsx("h2", { style: { marginBottom: "1rem" }, children: "\u00C9dition de la Mission" }), [
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
                            ].map((item, index) => (_jsxs("div", { style: { marginBottom: "8px" }, children: [_jsx("label", { style: { display: "block", marginBottom: "4px" }, children: item.label }), item.type === "textarea" ? (_jsx("textarea", { style: { width: "100%", height: "60px" }, value: editMission[item.field] || "", onChange: (e) => setEditMission({
                                            ...editMission,
                                            [item.field]: e.target.value,
                                        }) })) : item.field === "status" ? (_jsx("select", { style: { width: "100%" }, value: editMission[item.field] || "", onChange: (e) => setEditMission({
                                            ...editMission,
                                            [item.field]: e.target.value,
                                        }), children: item.options.map((opt) => (_jsx("option", { value: opt, children: opt }, opt))) })) : (_jsx("input", { style: { width: "100%" }, type: "text", value: editMission[item.field] || "", onChange: (e) => setEditMission({
                                            ...editMission,
                                            [item.field]: e.target.value,
                                        }) }))] }, index))), _jsxs("div", { style: {
                                    marginTop: "1rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                }, children: [_jsx("button", { onClick: handleSave, style: { backgroundColor: "#27ae60", color: "white" }, children: "Sauver" }), _jsx("button", { onClick: () => setShowModal(false), style: { backgroundColor: "#cccccc" }, children: "Annuler" }), _jsx("button", { onClick: handleDelete, style: { backgroundColor: "#e74c3c", color: "white" }, children: "Supprimer" })] })] })) }) })), _jsx("style", { children: `
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
      ` })] }));
};
export default Planning;

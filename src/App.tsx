import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import AdminPage from "./pages/AdminPage";

import PrestatairePage from "./pages/PrestatairePage";
import TechnicienPage from "./pages/TechnicienPage";

import Table from "./pages/AllMissionsTable";
import TablePresta from "./pages/AllMissionsPresta";
import TableTech from "./pages/AllMissionsTech";

import Planning from "./pages/Planning";
import PlanningPresta from "./pages/PlanningPresta";
import PlanningTech from "./pages/PlanningTech";

import Cardpay from "./pages/Cardpay";

function App() {
  return (
    <Router>
      <Routes>
        {/* REDIRECTION par défaut de / vers /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />

        <Route path="/admin" element={<AdminPage />} />
        <Route path="/prestataire" element={<PrestatairePage />} />
        <Route path="/technicien" element={<TechnicienPage />} />

        <Route path="/table" element={<Table />} />
        <Route path="/tablePresta" element={<TablePresta />} />
        <Route path="/tableTech" element={<TableTech />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/planningPresta" element={<PlanningPresta />} />
        <Route path="/planningTech" element={<PlanningTech />} />
        <Route
          path="/Cardpays"
          element={
            <Cardpay
              title={""}
              montant={0}
              onPayClick={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

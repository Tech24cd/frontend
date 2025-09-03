import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import AdminPage from "./pages/AdminPage";
import TechnicienPage from "./pages/TechnicienPage";
import PrestatairePage from "./pages/PrestatairePage";

import Table from "./pages/AllMissionsTable";
import TablePresta from "./pages/AllMissionsPresta";
import TableTech from "./pages/AllMissionsTech";
import Planning from "./pages/Planning";
import PlanningPresta from "./pages/PlanningPresta";
import PlanningTech from "./pages/PlanningTech";
import Cardpay from "./pages/Cardpay";
function App() {
  return _jsx(Router, {
    children: _jsxs(Routes, {
      children: [
        _jsx(Route, {
          path: "/",
          element: _jsx(Navigate, { to: "/login", replace: true }),
        }),
        _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }),
        _jsx(Route, {
          path: "/create-account",
          element: _jsx(CreateAccountPage, {}),
        }),
        _jsx(Route, { path: "/tech", element: _jsx(TechnicienPage, {}) }),

        _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }),
        _jsx(Route, {
          path: "/prestataire",
          element: _jsx(PrestatairePage, {}),
        }),

        _jsx(Route, { path: "/table", element: _jsx(Table, {}) }),
        _jsx(Route, { path: "/tablePresta", element: _jsx(TablePresta, {}) }),
        _jsx(Route, { path: "/tableTech", element: _jsx(TableTech, {}) }),

        _jsx(Route, { path: "/planning", element: _jsx(Planning, {}) }),
        _jsx(Route, {
          path: "/planningPresta",
          element: _jsx(PlanningPresta, {}),
        }),

        _jsx(Route, {
          path: "/planningTech",
          element: _jsx(PlanningTech, {}),
        }),

        _jsx(Route, {
          path: "/Cardpays",
          element: _jsx(Cardpay, {
            title: "",
            montant: 0,
            onPayClick: function () {
              throw new Error("Function not implemented.");
            },
          }),
        }),
      ],
    }),
  });
}
export default App;

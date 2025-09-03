import { jsx as _jsx } from "react/jsx-runtime";
import Cardpay from "./Cardpay";
const Paiement = () => {
    const handlePayClick = () => {
        // Remplace par ta vraie URL de paiement ou page externe de paiement
        window.location.href = "https://exemple-plateforme-paiement.com/checkout";
    };
    return (_jsx("div", { style: { background: "#f9f9f9", minHeight: "100vh", padding: "2rem" }, children: _jsx(Cardpay, { title: "Mission : Installation au client XYZ", montant: 1599.99, onPayClick: handlePayClick }) }));
};
export default Paiement;

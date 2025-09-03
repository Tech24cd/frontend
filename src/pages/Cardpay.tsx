// SimplePaymentCard.tsx
import "react-router-dom";

type CardpayProps = {
  title: string;
  montant: number;
  onPayClick: () => void;
};

const Cardpay: React.FC<CardpayProps> = ({ title, montant, onPayClick }) => {
  return (
    <div
      style={{
        maxWidth: 400,
        margin: "4rem auto",
        padding: "2rem",
        borderRadius: "16px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
        background: "#fff",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: "center",
        userSelect: "none",
      }}
    >
      <h2 style={{ marginBottom: "1rem", color: "#1b9c55" }}>{title}</h2>
      <p style={{ fontSize: "1.4rem", margin: "1rem 0", color: "#444" }}>
        Montant à payer :
      </p>
      <p
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          color: "#000",
        }}
      >
        {montant.toFixed(2)} €
      </p>

      <button
        onClick={onPayClick}
        style={{
          backgroundColor: "#1b9c55",
          color: "white",
          fontSize: "1.1rem",
          padding: "0.75rem 2rem",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#159944")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#1b9c55")
        }
        aria-label="Payer maintenant"
      >
        ➡️ Payer maintenant
      </button>
    </div>
  );
};

export default Cardpay;

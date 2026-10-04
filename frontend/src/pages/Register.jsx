import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      await axios.post(`${API}/auth/register`, {
        name,
        email,
        password,
      });

      setMessage("🎉 Account created successfully!");

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        setMessage(
          typeof error.response.data === "string"
            ? error.response.data
            : "❌ Registration failed"
        );
      } else {
        setMessage("❌ Backend server is not running");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>
      <div style={styles.circle3}></div>

      <div style={styles.card}>
        <div style={styles.logo}>
          ☁️
        </div>

        <h1 style={styles.title}>
          Cloud
          <span style={styles.titleColor}>Vault</span>
        </h1>

        <p style={styles.subtitle}>
          Create your secure cloud account
        </p>

        <form onSubmit={handleRegister}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              👤 Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              📧 Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              🔐 Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
            />

            <small style={styles.passwordHint}>
              🔒 Password must contain at least 6 characters
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "⏳ Creating Account..."
              : "🚀 Create Account"}
          </button>
        </form>

        {message && (
          <div
            style={{
              ...styles.message,
              color: message.includes("successfully")
                ? "#16a34a"
                : "#dc2626",
              background: message.includes("successfully")
                ? "#dcfce7"
                : "#fee2e2",
              border: message.includes("successfully")
                ? "1px solid #86efac"
                : "1px solid #fca5a5",
            }}
          >
            {message}
          </div>
        )}

        <p style={styles.loginText}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={styles.loginLink}
          >
            Login here →
          </Link>
        </p>

        <div style={styles.security}>
          <span>🔒</span>
          <span>Your data is secure & encrypted</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #020617 0%, #1e1b4b 35%, #312e81 65%, #581c87 100%)",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },

  circle1: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.45), rgba(59,130,246,0))",
    top: "-140px",
    left: "-120px",
    filter: "blur(5px)",
  },

  circle2: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(168,85,247,0.40), rgba(168,85,247,0))",
    bottom: "-180px",
    right: "-130px",
    filter: "blur(5px)",
  },

  circle3: {
    position: "absolute",
    width: "250px",
    height: "250px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(236,72,153,0.25), rgba(236,72,153,0))",
    top: "35%",
    right: "10%",
    filter: "blur(15px)",
  },

  card: {
    width: "430px",
    maxWidth: "100%",
    padding: "38px",
    borderRadius: "26px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))",
    backdropFilter: "blur(20px)",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.45)",
    border:
      "1px solid rgba(255,255,255,0.7)",
    position: "relative",
    zIndex: 2,
    boxSizing: "border-box",
  },

  logo: {
    width: "82px",
    height: "82px",
    margin: "0 auto 16px",
    borderRadius: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "40px",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed, #db2777)",
    boxShadow:
      "0 15px 35px rgba(79,70,229,0.45)",
    border:
      "4px solid rgba(255,255,255,0.8)",
  },

  title: {
    textAlign: "center",
    margin: "5px 0",
    fontSize: "34px",
    fontWeight: "800",
    letterSpacing: "-1px",
    color: "#111827",
  },

  titleColor: {
    background:
      "linear-gradient(90deg, #2563eb, #7c3aed, #db2777)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "30px",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  inputGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "13px",
    outline: "none",
    fontSize: "15px",
    color: "#1e293b",
    background:
      "linear-gradient(135deg, #f8fafc, #eff6ff)",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    boxShadow:
      "0 3px 10px rgba(15,23,42,0.04)",
  },

  passwordHint: {
    display: "block",
    marginTop: "7px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  button: {
    width: "100%",
    padding: "16px",
    marginTop: "5px",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    letterSpacing: "0.2px",
    boxShadow:
      "0 12px 25px rgba(79,70,229,0.35)",
    transition: "all 0.3s ease",
  },

  message: {
    textAlign: "center",
    marginTop: "20px",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
  },

  loginText: {
    textAlign: "center",
    marginTop: "26px",
    color: "#64748b",
    fontSize: "14px",
  },

  loginLink: {
    color: "#6366f1",
    fontWeight: "800",
    textDecoration: "none",
    marginLeft: "3px",
  },

  security: {
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "7px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "12px",
  },
};

export default Register;
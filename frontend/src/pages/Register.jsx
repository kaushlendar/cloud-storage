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

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      await axios.post("http://localhost:8080/api/auth/register", {
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
      console.error(error);

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
      {/* Background Circles */}
      <div style={styles.circle1}></div>
      <div style={styles.circle2}></div>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          ☁️
        </div>

        <h1 style={styles.title}>
          Cloud<span style={styles.titleColor}>Vault</span>
        </h1>

        <p style={styles.subtitle}>
          Create your secure cloud account
        </p>

        <form onSubmit={handleRegister}>
          {/* Name */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>👤 Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>📧 Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>🔐 Password</label>

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
              Password must contain at least 6 characters
            </small>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating Account..." : "Create Account 🚀"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div
            style={{
              ...styles.message,
              color: message.includes("successfully")
                ? "#16a34a"
                : "#dc2626",
            }}
          >
            {message}
          </div>
        )}

        {/* Login */}
        <p style={styles.loginText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.loginLink}>
            Login here
          </Link>
        </p>

        {/* Security */}
        <div style={styles.security}>
          🔒 Your data is secure & encrypted
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },

  circle1: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.25)",
    top: "-100px",
    left: "-100px",
    filter: "blur(5px)",
  },

  circle2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(168, 85, 247, 0.2)",
    bottom: "-150px",
    right: "-100px",
    filter: "blur(5px)",
  },

  card: {
    width: "420px",
    maxWidth: "100%",
    padding: "35px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    boxShadow:
      "0 25px 60px rgba(0, 0, 0, 0.35)",
    position: "relative",
    zIndex: 2,
    boxSizing: "border-box",
  },

  logo: {
    width: "75px",
    height: "75px",
    margin: "0 auto 15px",
    borderRadius: "22px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "38px",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    boxShadow:
      "0 10px 25px rgba(37, 99, 235, 0.4)",
  },

  title: {
    textAlign: "center",
    margin: "5px 0",
    fontSize: "32px",
    fontWeight: "800",
    color: "#111827",
  },

  titleColor: {
    color: "#6366f1",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "28px",
    fontSize: "14px",
  },

  inputGroup: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    border: "1px solid #dbeafe",
    borderRadius: "12px",
    outline: "none",
    fontSize: "15px",
    background: "#f8fafc",
    boxSizing: "border-box",
    transition: "0.3s",
  },

  passwordHint: {
    display: "block",
    marginTop: "6px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  button: {
    width: "100%",
    padding: "15px",
    marginTop: "8px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 10px 20px rgba(79, 70, 229, 0.3)",
  },

  message: {
    textAlign: "center",
    marginTop: "18px",
    fontSize: "14px",
    fontWeight: "600",
  },

  loginText: {
    textAlign: "center",
    marginTop: "25px",
    color: "#64748b",
    fontSize: "14px",
  },

  loginLink: {
    color: "#4f46e5",
    fontWeight: "700",
    textDecoration: "none",
  },

  security: {
    marginTop: "22px",
    paddingTop: "18px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "center",
    color: "#64748b",
    fontSize: "12px",
  },
};

export default Register;
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );

      setMessage("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);

    } catch (error) {
      console.error(error);

      if (error.response) {
        setMessage(
          typeof error.response.data === "string"
            ? error.response.data
            : "Invalid email or password"
        );
      } else {
        setMessage("Backend server is not running");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #2563eb, #7c3aed, #9333ea)",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "24px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          boxSizing: "border-box",
        }}
      >

        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "40px",
          }}
        >
          ☁️
        </div>

        <h1
          style={{
            textAlign: "center",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Cloud Storage
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "30px",
          }}
        >
          Welcome back! Login to continue
        </p>

        <form onSubmit={handleLogin}>

          <label
            style={{
              display: "block",
              color: "#374151",
              fontWeight: "600",
              marginBottom: "7px",
            }}
          >
            📧 Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              boxSizing: "border-box",
              marginBottom: "20px",
            }}
          />

          <label
            style={{
              display: "block",
              color: "#374151",
              fontWeight: "600",
              marginBottom: "7px",
            }}
          >
            🔒 Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              boxSizing: "border-box",
              marginBottom: "24px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background:
                "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading ? "Logging in..." : "🚀 Login"}
          </button>

        </form>

        {message && (
          <p
            style={{
              textAlign: "center",
              marginTop: "18px",
              color: message.includes("successful")
                ? "#16a34a"
                : "#dc2626",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginTop: "25px",
          }}
        >
          Don't have an account?{" "}

          <Link
            to="/register"
            style={{
              color: "#2563eb",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
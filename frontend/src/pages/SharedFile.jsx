import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function SharedFile() {
  const { token } = useParams();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API = "http://localhost:8080/api";

  useEffect(() => {
    loadSharedFile();
  }, [token]);

  const loadSharedFile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        `${API}/shares/link/${token}`
      );

      setFile(response.data);
    } catch (error) {
      console.error("Shared file error:", error);
      setMessage("Shared file not found or link is inactive ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${API}/shares/download/${token}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file?.file?.fileName || "shared-file";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setMessage("Unable to download file ❌");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Loading shared file...</h2>
      </div>
    );
  }

  if (!file) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>❌ Shared File Not Found</h2>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  const sharedFile = file.file || file;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📄</div>

        <h2>{sharedFile.fileName}</h2>

        <p style={styles.info}>
          This file has been shared with you.
        </p>

        {sharedFile.fileSize && (
          <p>
            <strong>Size:</strong>{" "}
            {(sharedFile.fileSize / 1024).toFixed(2)} KB
          </p>
        )}

        <button
          onClick={handleDownload}
          style={styles.button}
        >
          ⬇️ Download File
        </button>

        {message && (
          <p style={styles.message}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "40px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 5px 25px rgba(0,0,0,0.1)",
  },

  icon: {
    fontSize: "60px",
    marginBottom: "15px",
  },

  info: {
    color: "#666",
    marginBottom: "20px",
  },

  button: {
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },

  message: {
    marginTop: "20px",
    color: "#dc2626",
  },
};

export default SharedFile;
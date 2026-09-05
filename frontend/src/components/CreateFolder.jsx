import { useState } from "react";
import axios from "axios";
import "../styles/CreateFolder.css";

function CreateFolder({ userId, onFolderCreated, onClose }) {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateFolder = async (e) => {
    e.preventDefault();

    if (!folderName.trim()) {
      setMessage("Please enter a folder name.");
      return;
    }

    if (!userId) {
      setMessage("User not found.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/folders/create",
        {
          folderName: folderName.trim(),
          userId: userId,
        }
      );

      setMessage("Folder created successfully! 🎉");
      setFolderName("");

      if (onFolderCreated) {
        onFolderCreated(response.data);
      }

      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 800);
    } catch (error) {
      console.error("Create folder error:", error);

      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage(
          "Folder creation failed. Please check backend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="folder-modal-overlay">

      <div className="folder-modal">

        {/* Header */}
        <div className="folder-modal-header">

          <div className="folder-modal-icon">
            📁
          </div>

          <div>
            <h2>Create New Folder</h2>
            <p>
              Organize your files easily
            </p>
          </div>

          <button
            className="folder-close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>

        </div>

        {/* Form */}
        <form onSubmit={handleCreateFolder}>

          <div className="folder-form-group">

            <label htmlFor="folderName">
              Folder Name
            </label>

            <input
              id="folderName"
              type="text"
              placeholder="Enter folder name..."
              value={folderName}
              onChange={(e) =>
                setFolderName(e.target.value)
              }
              autoFocus
              disabled={loading}
            />

          </div>

          {/* Message */}
          {message && (
            <div className="folder-message">
              💡 {message}
            </div>
          )}

          {/* Buttons */}
          <div className="folder-modal-actions">

            <button
              type="button"
              className="folder-cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="folder-create-button"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "📁 Create Folder"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateFolder;
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "../styles/dashboard.css";

function Dashboard() {
  // =====================================================
  // STATE
  // =====================================================

  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState("My Drive");
  const [viewMode, setViewMode] = useState("grid");

  // Share state
  const [shareFile, setShareFile] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  // Currently opened folder
  const [currentFolder, setCurrentFolder] = useState(null);

  const fileInputRef = useRef(null);

  const API = "http://localhost:8080/api";

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("User parsing error:", error);

      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, []);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (!user?.id) return;

    if (activeMenu === "Starred") {
      loadStarredFiles();
    } else if (activeMenu === "Recent") {
      loadRecentFiles();
    } else if (activeMenu === "Trash") {
      loadTrashFiles();
    } else {
      loadFiles(currentFolder?.id ?? null);
      loadFolders();
    }
  }, [user, currentFolder?.id, activeMenu]);

  // =====================================================
  // LOAD FILES
  // =====================================================

  const loadFiles = async (folderId = null) => {
    if (!user?.id) return;

    try {
      let url;

      // Folder open hai
      if (folderId) {
        url = `${API}/files/user/${user.id}/folder/${folderId}`;
      } else {
        // My Drive / Root
        url = `${API}/files/user/${user.id}`;
      }

      const response = await axios.get(url);

      setFiles(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Load files error:", error);

      setMessage(
        "Unable to load files. Please check your backend."
      );

      setFiles([]);
    }
  };

  // =====================================================
  // LOAD STARRED FILES
  // =====================================================

  const loadStarredFiles = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(
        `${API}/files/user/${user.id}/starred`
      );

      setFiles(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Load starred files error:",
        error
      );

      setMessage(
        "Unable to load starred files. Please check backend."
      );

      setFiles([]);
    }
  };

  // =====================================================
  // LOAD RECENT FILES
  // =====================================================

  const loadRecentFiles = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(
        `${API}/files/user/${user.id}/recent`
      );

      const recentFiles = Array.isArray(response.data)
        ? response.data
        : [];

      // Latest uploaded file first
      recentFiles.sort((a, b) => {
        return (
          new Date(b.uploadedAt) -
          new Date(a.uploadedAt)
        );
      });

      setFiles(recentFiles);
      setCurrentFolder(null);
    } catch (error) {
      console.error(
        "Load recent files error:",
        error
      );

      setMessage(
        "Unable to load recent files. Please check backend."
      );

      setFiles([]);
    }
  };

  // =====================================================
  // LOAD TRASH FILES
  // =====================================================

  const loadTrashFiles = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(
        `${API}/files/user/${user.id}/trash`
      );

      setFiles(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setCurrentFolder(null);
    } catch (error) {
      console.error(
        "Load trash files error:",
        error
      );

      setMessage(
        "Unable to load Trash files. Please check backend."
      );

      setFiles([]);
    }
  };

  // =====================================================
  // LOAD FOLDERS
  // =====================================================

  const loadFolders = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(
        `${API}/folders/user/${user.id}`
      );

      setFolders(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Load folders error:",
        error
      );

      setMessage(
        "Unable to load folders. Please check backend."
      );

      setFolders([]);
    }
  };

  // =====================================================
  // REFRESH DASHBOARD
  // =====================================================

  const refreshDashboard = async () => {
    if (!user?.id) return;

    setMessage("");
    setLoading(true);

    try {
      if (activeMenu === "Starred") {
        await loadStarredFiles();
      } else if (activeMenu === "Recent") {
        await loadRecentFiles();
      } else if (activeMenu === "Trash") {
        await loadTrashFiles();
      } else {
        await Promise.all([
          loadFiles(currentFolder?.id ?? null),
          loadFolders(),
        ]);
      }

      setMessage(
        "Dashboard refreshed successfully 🔄"
      );
    } catch (error) {
      console.error(
        "Dashboard refresh error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER FILES
  // =====================================================

  const filteredFiles = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    let currentFiles = files;

    // -----------------------------------------------------
    // STARRED
    // -----------------------------------------------------

    if (activeMenu === "Starred") {
      currentFiles = files.filter(
        (file) => file.starred === true
      );
    }

    // -----------------------------------------------------
    // RECENT
    // -----------------------------------------------------

    else if (activeMenu === "Recent") {
      currentFiles = [...files].sort(
        (a, b) =>
          new Date(b.uploadedAt) -
          new Date(a.uploadedAt)
      );
    }

    // -----------------------------------------------------
    // TRASH
    // -----------------------------------------------------

    else if (activeMenu === "Trash") {
      currentFiles = files.filter(
        (file) => file.trashed === true
      );
    }

    // -----------------------------------------------------
    // CURRENT FOLDER
    // -----------------------------------------------------

    else if (currentFolder) {
      currentFiles = files.filter((file) => {
        const fileFolderId =
          file.folderId ??
          file.folder?.id ??
          null;

        return (
          !file.trashed &&
          String(fileFolderId) ===
          String(currentFolder.id)
        );
      });
    }

    // -----------------------------------------------------
    // ROOT / MY DRIVE
    // -----------------------------------------------------

    else {
      currentFiles = files.filter((file) => {
        const fileFolderId =
          file.folderId ??
          file.folder?.id ??
          null;

        return (
          !file.trashed &&
          (fileFolderId === null ||
            fileFolderId === undefined)
        );
      });
    }

    // -----------------------------------------------------
    // SEARCH
    // -----------------------------------------------------

    if (!keyword) {
      return currentFiles;
    }

    return currentFiles.filter((file) =>
      file.fileName
        ?.toLowerCase()
        .includes(keyword)
    );
  }, [
    files,
    search,
    currentFolder,
    activeMenu,
  ]);

  // =====================================================
  // FILTER FOLDERS
  // =====================================================

  const filteredFolders = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return folders;
    }

    return folders.filter((folder) =>
      folder.folderName
        ?.toLowerCase()
        .includes(keyword)
    );
  }, [folders, search]);

  // =====================================================
  // OPEN FILE SELECTOR
  // =====================================================

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // =====================================================
  // SELECT FILE
  // =====================================================

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setMessage("");
  };

  // =====================================================
  // UPLOAD FILE
  // =====================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage(
        "Please select a file first 📁"
      );
      return;
    }

    if (!user?.id) {
      setMessage("User not found.");
      return;
    }

    const formData = new FormData();

    // File
    formData.append(
      "file",
      selectedFile
    );

    // User ID
    formData.append(
      "userId",
      user.id
    );

    // Folder ID
    if (currentFolder?.id) {
      formData.append(
        "folderId",
        currentFolder.id
      );
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${API}/files/upload`,
        formData
      );

      if (currentFolder) {
        setMessage(
          `"${selectedFile.name}" uploaded inside "${currentFolder.folderName}" 📁🎉`
        );
      } else {
        setMessage(
          `"${selectedFile.name}" uploaded successfully 🎉`
        );
      }

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadFiles(
        currentFolder?.id ?? null
      );
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      if (error.response) {
        console.error(
          "Backend response:",
          error.response.data
        );
      }

      setMessage(
        "File upload failed. Please check backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DOWNLOAD FILE
  // =====================================================

  const handleDownload = async (file) => {
    try {
      setMessage("");

      const response = await axios.get(
        `${API}/files/download/${file.id}`,
        {
          responseType: "blob",
        }
      );

      const url =
        window.URL.createObjectURL(
          new Blob([response.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        file.fileName || "download"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage(
        `"${file.fileName}" download started ⬇️`
      );
    } catch (error) {
      console.error(
        "Download error:",
        error
      );

      setMessage(
        "Download failed ❌"
      );
    }
  };

  // =====================================================
  // CREATE SHARE LINK
  // =====================================================

  const handleShare = async (file) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API}/shares/create/${file.id}/${user.id}`
      );

      const token = response.data?.shareToken;

      if (!token) {
        throw new Error("Share token was not returned by backend");
      }

      const link = `${window.location.origin}/shared/${token}`;

      setShareFile(file);
      setShareLink(link);
      setShowShareModal(true);
      setMessage("Share link created successfully 🔗");
    } catch (error) {
      console.error("Share error:", error);
      setMessage(
        error.response?.data || "Share link creation failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setMessage("Share link copied to clipboard 📋");
    } catch (error) {
      console.error("Copy share link error:", error);
      setMessage("Unable to copy share link ❌");
    }
  };

  // =====================================================
  // DELETE FILE / MOVE TO TRASH
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to move this file to Trash?"
      );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await axios.delete(
        `${API}/files/${id}`
      );

      setMessage(
        "File moved to Trash successfully 🗑️"
      );

      if (activeMenu === "Starred") {
        await loadStarredFiles();
      } else if (activeMenu === "Recent") {
        await loadRecentFiles();
      } else if (activeMenu === "Trash") {
        await loadTrashFiles();
      } else {
        await loadFiles(
          currentFolder?.id ?? null
        );
      }
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setMessage(
        "File deletion failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESTORE FILE FROM TRASH
  // =====================================================

  const handleRestore = async (id) => {
    const confirmRestore =
      window.confirm(
        "Do you want to restore this file?"
      );

    if (!confirmRestore) return;

    try {
      setLoading(true);
      setMessage("");

      await axios.put(
        `${API}/files/restore/${id}`
      );

      setMessage(
        "File restored successfully ♻️"
      );

      await loadTrashFiles();
    } catch (error) {
      console.error(
        "Restore error:",
        error
      );

      setMessage(
        "File restore failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PERMANENT DELETE
  // =====================================================

  const handlePermanentDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "⚠️ This will permanently delete the file. This action cannot be undone. Continue?"
      );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      setMessage("");

      await axios.delete(
        `${API}/files/permanent/${id}`
      );

      setMessage(
        "File permanently deleted ❌"
      );

      await loadTrashFiles();
    } catch (error) {
      console.error(
        "Permanent delete error:",
        error
      );

      setMessage(
        "Permanent deletion failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STAR / UNSTAR FILE
  // =====================================================

  const handleToggleStar = async (file) => {
    try {
      setMessage("");

      const response = await axios.put(
        `${API}/files/star/${file.id}`
      );

      const updatedFile = response.data;

      // -------------------------------------------------
      // STARRED PAGE
      // -------------------------------------------------

      if (activeMenu === "Starred") {
        if (updatedFile.starred) {
          setFiles((prevFiles) =>
            prevFiles.map((item) =>
              item.id === updatedFile.id
                ? updatedFile
                : item
            )
          );
        } else {
          setFiles((prevFiles) =>
            prevFiles.filter(
              (item) =>
                item.id !== updatedFile.id
            )
          );
        }
      }

      // -------------------------------------------------
      // OTHER PAGES
      // -------------------------------------------------

      else {
        setFiles((prevFiles) =>
          prevFiles.map((item) =>
            item.id === updatedFile.id
              ? updatedFile
              : item
          )
        );
      }

      setMessage(
        updatedFile.starred
          ? `"${file.fileName}" added to Starred ⭐`
          : `"${file.fileName}" removed from Starred`
      );
    } catch (error) {
      console.error(
        "Star toggle error:",
        error
      );

      setMessage(
        "Unable to update Starred status ❌"
      );
    }
  };

  // =====================================================
  // CREATE FOLDER
  // =====================================================

  const handleNew = async () => {
    const folderName =
      window.prompt(
        "Enter folder name:"
      );

    if (
      !folderName ||
      !folderName.trim()
    ) {
      return;
    }

    if (!user?.id) {
      setMessage(
        "User not found."
      );
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/folders/create`,
        {
          folderName:
            folderName.trim(),
          userId:
            user.id,
        }
      );

      setMessage(
        `Folder "${folderName.trim()}" created successfully 📁`
      );

      await loadFolders();
    } catch (error) {
      console.error(
        "Create folder error:",
        error
      );

      setMessage(
        "Folder creation failed. Please check backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE FOLDER
  // =====================================================

  const handleDeleteFolder = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this folder?"
      );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await axios.delete(
        `${API}/folders/${id}`
      );

      setMessage(
        "Folder deleted successfully 🗑️"
      );

      if (
        currentFolder &&
        String(currentFolder.id) ===
          String(id)
      ) {
        setCurrentFolder(null);
      }

      await Promise.all([
        loadFolders(),
        loadFiles(
          currentFolder &&
            String(currentFolder.id) ===
              String(id)
            ? null
            : currentFolder?.id ?? null
        ),
      ]);
    } catch (error) {
      console.error(
        "Delete folder error:",
        error
      );

      setMessage(
        "Folder deletion failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OPEN FOLDER
  // =====================================================

  const handleOpenFolder = (folder) => {
    setCurrentFolder(folder);
    setActiveMenu("My Drive");
    setSearch("");
    setSelectedFile(null);

    setMessage(
      `Opened folder "${folder.folderName}" 📁`
    );
  };

  // =====================================================
  // BACK TO MY DRIVE
  // =====================================================

  const handleBackToDrive = () => {
    setCurrentFolder(null);
    setActiveMenu("My Drive");
    setSearch("");
    setSelectedFile(null);

    setMessage(
      "Back to My Drive 🏠"
    );
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleMenuClick = async (menu) => {
    setActiveMenu(menu);
    setCurrentFolder(null);
    setSearch("");
    setSelectedFile(null);

    // -------------------------------------------------
    // MY DRIVE
    // -------------------------------------------------

    if (menu === "My Drive") {
      setMessage("");

      await loadFiles(null);
      await loadFolders();

      return;
    }

    // -------------------------------------------------
    // STARRED
    // -------------------------------------------------

    if (menu === "Starred") {
      setMessage(
        "Loading Starred files ⭐"
      );

      await loadStarredFiles();

      return;
    }

    // -------------------------------------------------
    // RECENT
    // -------------------------------------------------

    if (menu === "Recent") {
      setMessage(
        "Loading Recent files 🕘"
      );

      await loadRecentFiles();

      return;
    }

    // -------------------------------------------------
    // TRASH
    // -------------------------------------------------

    if (menu === "Trash") {
      setMessage(
        "Loading Trash files 🗑️"
      );

      await loadTrashFiles();

      return;
    }

    // -------------------------------------------------
    // OTHER MENU
    // -------------------------------------------------

    setFiles([]);

    setMessage(
      `${menu} section is coming soon 🚀`
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("user");

    window.location.href =
      "/login";
  };

  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) {
      return "0 Bytes";
    }

    const sizes = [
      "Bytes",
      "KB",
      "MB",
      "GB",
      "TB",
    ];

    const i = Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );

    return (
      Math.round(
        (bytes /
          Math.pow(
            1024,
            i
          )) *
          100
      ) /
        100 +
      " " +
      sizes[i]
    );
  };

  // =====================================================
  // FILE ICON
  // =====================================================

  const getFileIcon = (
    fileName = ""
  ) => {
    const extension =
      fileName
        .split(".")
        .pop()
        ?.toLowerCase();

    // Images
    if (
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
      ].includes(extension)
    ) {
      return "🖼️";
    }

    // PDF
    if (
      extension === "pdf"
    ) {
      return "📕";
    }

    // Word
    if (
      [
        "doc",
        "docx",
      ].includes(extension)
    ) {
      return "📘";
    }

    // Excel
    if (
      [
        "xls",
        "xlsx",
        "csv",
      ].includes(extension)
    ) {
      return "📗";
    }

    // ZIP
    if (
      [
        "zip",
        "rar",
        "7z",
      ].includes(extension)
    ) {
      return "🗜️";
    }

    // Video
    if (
      [
        "mp4",
        "mkv",
        "avi",
        "mov",
      ].includes(extension)
    ) {
      return "🎬";
    }

    // Audio
    if (
      [
        "mp3",
        "wav",
      ].includes(extension)
    ) {
      return "🎵";
    }

    // Code
    if (
      [
        "js",
        "jsx",
        "ts",
        "tsx",
        "java",
        "py",
        "php",
        "css",
        "html",
      ].includes(extension)
    ) {
      return "💻";
    }

    // Text
    if (
      [
        "txt",
        "md",
        "json",
        "xml",
      ].includes(extension)
    ) {
      return "📝";
    }

    return "📄";
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-card">
          <div className="loading-cloud">
            ☁️
          </div>

          <div className="loading-spinner"></div>

          <h3>
            Loading Cloud Storage...
          </h3>

          <p>
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="brand">
          <div className="brand-icon">
            ☁️
          </div>

          <div>
            <div className="brand-title">
              Cloud Storage
            </div>

            <div className="brand-subtitle">
              Secure • Simple • Fast
            </div>
          </div>
        </div>

        {/* NEW */}

        <button
          className="new-button"
          onClick={handleNew}
        >
          <span className="new-icon">
            ＋
          </span>

          <span>
            New
          </span>
        </button>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          {/* MY DRIVE */}

          <button
            className={
              activeMenu === "My Drive"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              handleMenuClick(
                "My Drive"
              )
            }
          >
            <span>
              🏠
            </span>

            <span>
              My Drive
            </span>
          </button>

          {/* SHARED */}

          <button
            className={
              activeMenu === "Shared"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              handleMenuClick(
                "Shared"
              )
            }
          >
            <span>
              👥
            </span>

            <span>
              Shared
            </span>
          </button>

          {/* STARRED */}

          <button
            className={
              activeMenu === "Starred"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              handleMenuClick(
                "Starred"
              )
            }
          >
            <span>
              ⭐
            </span>

            <span>
              Starred
            </span>
          </button>

          {/* RECENT */}

          <button
            className={
              activeMenu === "Recent"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              handleMenuClick(
                "Recent"
              )
            }
          >
            <span>
              🕘
            </span>

            <span>
              Recent
            </span>
          </button>

          {/* TRASH */}

          <button
            className={
              activeMenu === "Trash"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              handleMenuClick(
                "Trash"
              )
            }
          >
            <span>
              🗑️
            </span>

            <span>
              Trash
            </span>
          </button>

        </nav>

        {/* STORAGE */}

        <div className="storage-box">
          <div className="storage-header">

            <span>
              ☁️ Storage
            </span>

            <span className="storage-percent">
              15%
            </span>

          </div>

          <div className="storage-bar">
            <div
              className="storage-progress"
              style={{
                width: "15%",
              }}
            ></div>
          </div>

          <div className="storage-info">
            {files.length} file(s) stored
          </div>
        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div className="header-left">

            <h1>
              {currentFolder
                ? currentFolder.folderName
                : activeMenu}
            </h1>

            <p>
              {currentFolder
                ? "Manage files inside this folder 📁"
                : activeMenu === "Starred"
                ? "Your favorite files are here ⭐"
                : activeMenu === "Recent"
                ? "Your recently uploaded files are here 🕘"
                : activeMenu === "Trash"
                ? "Deleted files are stored here 🗑️"
                : "Manage your files securely from one beautiful place ✨"}
            </p>

          </div>

          {/* PROFILE */}

          <div className="profile-card">

            <div className="profile-avatar">
              {user.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="profile-info">

              <strong>
                {user.name}
              </strong>

              <small>
                {user.email}
              </small>

            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </header>

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        {currentFolder && (
          <div className="breadcrumb">

            <button
              onClick={
                handleBackToDrive
              }
              className="breadcrumb-home"
            >
              🏠 My Drive
            </button>

            <span>
              /
            </span>

            <span className="breadcrumb-current">
              📁{" "}
              {currentFolder.folderName}
            </span>

          </div>
        )}

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="toolbar">

          <div className="search-box">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder={
                activeMenu === "Starred"
                  ? "Search starred files..."
                  : activeMenu === "Recent"
                  ? "Search recent files..."
                  : activeMenu === "Trash"
                  ? "Search trash files..."
                  : currentFolder
                  ? "Search files in this folder..."
                  : "Search your files and folders..."
              }
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (
              <button
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>

          <div className="toolbar-actions">

            <button
              className="upload-toolbar-button"
              onClick={
                openFileSelector
              }
              disabled={
                activeMenu !== "My Drive"
              }
              title={
                activeMenu !== "My Drive"
                  ? "Upload is available in My Drive"
                  : "Upload file"
              }
            >
              ⬆ Upload
            </button>

            {!currentFolder &&
              activeMenu === "My Drive" && (
                <button
                  className="new-toolbar-button"
                  onClick={handleNew}
                >
                  ＋ New Folder
                </button>
              )}

            {currentFolder && (
              <button
                className="new-toolbar-button"
                onClick={
                  handleBackToDrive
                }
              >
                ← Back
              </button>
            )}

            <button
              className="refresh-toolbar-button"
              onClick={
                refreshDashboard
              }
              title="Refresh"
              disabled={loading}
            >
              {loading
                ? "⏳"
                : "🔄"}
            </button>

            <button
              className={
                viewMode === "grid"
                  ? "view-button active"
                  : "view-button"
              }
              onClick={() =>
                setViewMode("grid")
              }
              title="Grid view"
            >
              ▦
            </button>

            <button
              className={
                viewMode === "list"
                  ? "view-button active"
                  : "view-button"
              }
              onClick={() =>
                setViewMode("list")
              }
              title="List view"
            >
              ☰
            </button>

          </div>

        </section>

        {/* =================================================
            UPLOAD CARD
        ================================================= */}

        {activeMenu === "My Drive" && (
          <section className="upload-card">

            <div className="upload-circle">
              ⬆️
            </div>

            <div className="upload-content">

              <h2>
                {currentFolder
                  ? `Upload to "${currentFolder.folderName}"`
                  : "Upload your files"}
              </h2>

              <p>
                {currentFolder
                  ? "Selected file will be stored inside this folder."
                  : "Select a file from your computer and store it securely in your cloud."}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                onChange={
                  handleFileSelect
                }
                className="hidden-input"
              />

              <button
                className="choose-button"
                onClick={
                  openFileSelector
                }
              >
                📁 Choose File
              </button>

              {selectedFile && (
                <div className="selected-file">

                  <span>
                    {getFileIcon(
                      selectedFile.name
                    )}
                  </span>

                  <span className="selected-file-name">
                    {selectedFile.name}
                  </span>

                  <button
                    onClick={
                      handleUpload
                    }
                    disabled={loading}
                    className="small-upload-button"
                  >
                    {loading
                      ? "Uploading..."
                      : currentFolder
                      ? "Upload to Folder"
                      : "Upload Now"}
                  </button>

                </div>
              )}

            </div>

            <div className="upload-side-info">

              <div>
                🔒 Secure
              </div>

              <div>
                ⚡ Fast
              </div>

              <div>
                ☁️ Cloud
              </div>

            </div>

          </section>
        )}

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div className="message-box">

            <span>
              💡
            </span>

            <span>
              {message}
            </span>

            <button
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            FOLDERS
        ================================================= */}

        {!currentFolder &&
          activeMenu === "My Drive" && (
            <section className="file-section">

              <div className="section-header">

                <div>

                  <h2>
                    📁 My Folders
                  </h2>

                  <p>
                    {search
                      ? `${filteredFolders.length} folder(s) found`
                      : `${folders.length} folder(s)`}
                  </p>

                </div>

                <button
                  onClick={handleNew}
                  className="refresh-button"
                >
                  ＋ New Folder
                </button>

              </div>

              {filteredFolders.length ===
              0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    📁
                  </div>

                  <h2>
                    {search
                      ? "No folders found"
                      : "No folders yet"}
                  </h2>

                  <p>
                    {search
                      ? "Try another folder name."
                      : "Create your first folder to organize your files."}
                  </p>

                  {!search && (
                    <button
                      onClick={
                        handleNew
                      }
                      className="empty-button"
                    >
                      ＋ Create Folder
                    </button>
                  )}

                </div>

              ) : (

                <div className="file-grid">

                  {filteredFolders.map(
                    (folder) => (

                      <div
                        key={folder.id}
                        className="file-card folder-card"
                      >

                        <div className="file-top">

                          <div className="file-icon folder-icon">
                            📁
                          </div>

                          <button
                            className="more-button"
                            title="Delete folder"
                            onClick={() =>
                              handleDeleteFolder(
                                folder.id
                              )
                            }
                          >
                            ⋮
                          </button>

                        </div>

                        <h3
                          className="file-name"
                          title={
                            folder.folderName
                          }
                        >
                          {folder.folderName}
                        </h3>

                        <div className="file-meta">

                          <span>
                            Folder
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {folder.createdAt
                              ? new Date(
                                  folder.createdAt
                                ).toLocaleDateString()
                              : "Unknown date"}
                          </span>

                        </div>

                        <div className="card-actions">

                          <button
                            className="download-button open-folder-button"
                            onClick={() =>
                              handleOpenFolder(
                                folder
                              )
                            }
                          >
                            📂 Open
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDeleteFolder(
                                folder.id
                              )
                            }
                          >
                            🗑️
                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>
          )}

        {/* =================================================
            FILES
        ================================================= */}

        <section className="file-section">

          <div className="section-header">

            <div>

              <h2>

                {activeMenu === "Starred"
                  ? "⭐ Starred Files"
                  : activeMenu === "Recent"
                  ? "🕘 Recent Files"
                  : activeMenu === "Trash"
                  ? "🗑️ Trash Files"
                  : currentFolder
                  ? `📂 Files in ${currentFolder.folderName}`
                  : "📂 My Files"}

              </h2>

              <p>
                {search
                  ? `${filteredFiles.length} result(s) found`
                  : `${filteredFiles.length} file(s)`}
              </p>

            </div>

            <button
              onClick={() => {

                if (
                  activeMenu ===
                  "Starred"
                ) {
                  loadStarredFiles();
                }

                else if (
                  activeMenu ===
                  "Recent"
                ) {
                  loadRecentFiles();
                }

                else if (
                  activeMenu ===
                  "Trash"
                ) {
                  loadTrashFiles();
                }

                else {
                  loadFiles(
                    currentFolder?.id ??
                      null
                  );
                }

              }}
              className="refresh-button"
            >
              🔄 Refresh
            </button>

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredFiles.length ===
          0 ? (

            <div className="empty-state">

              <div className="empty-icon">

                {activeMenu ===
                "Starred"
                  ? "⭐"
                  : activeMenu ===
                    "Recent"
                  ? "🕘"
                  : activeMenu ===
                    "Trash"
                  ? "🗑️"
                  : currentFolder
                  ? "📁"
                  : search
                  ? "🔍"
                  : "📂"}

              </div>

              <h2>

                {activeMenu ===
                "Starred"
                  ? "No starred files"
                  : activeMenu ===
                    "Recent"
                  ? "No recent files"
                  : activeMenu ===
                    "Trash"
                  ? "Trash is empty"
                  : search
                  ? "No files found"
                  : currentFolder
                  ? "This folder is empty"
                  : "No files yet"}

              </h2>

              <p>

                {activeMenu ===
                "Starred"
                  ? "Star your important files to find them here."
                  : activeMenu ===
                    "Recent"
                  ? "Recently uploaded files will appear here."
                  : activeMenu ===
                    "Trash"
                  ? "Files you delete will appear here."
                  : search
                  ? "Try another file name."
                  : currentFolder
                  ? "Upload your first file into this folder."
                  : "Upload your first file to get started."}

              </p>

              {activeMenu ===
                "My Drive" && (

                <button
                  onClick={
                    openFileSelector
                  }
                  className="empty-button"
                >
                  ⬆ Upload File
                </button>

              )}

            </div>

          ) : viewMode ===
            "grid" ? (

            /* =================================================
               GRID VIEW
            ================================================= */

            <div className="file-grid">

              {filteredFiles.map(
                (file) => (

                  <div
                    key={file.id}
                    className="file-card"
                  >

                    <div className="file-top">

                      <div className="file-icon">
                        {getFileIcon(
                          file.fileName
                        )}
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "6px",
                        }}
                      >

                        {/* STAR BUTTON */}

                        <button
                          className="more-button"
                          title={
                            file.starred
                              ? "Remove from Starred"
                              : "Add to Starred"
                          }
                          onClick={() =>
                            handleToggleStar(
                              file
                            )
                          }
                          style={{
                            color:
                              file.starred
                                ? "#f5b301"
                                : "#999",
                            fontSize:
                              "20px",
                          }}
                        >
                          {file.starred
                            ? "★"
                            : "☆"}
                        </button>

                        {/* TRASH PAGE ACTIONS */}

                        {activeMenu ===
                        "Trash" ? (

                          <>
                            <button
                              className="more-button"
                              title="Restore file"
                              onClick={() =>
                                handleRestore(
                                  file.id
                                )
                              }
                            >
                              ♻️
                            </button>

                            <button
                              className="more-button"
                              title="Permanently delete"
                              onClick={() =>
                                handlePermanentDelete(
                                  file.id
                                )
                              }
                            >
                              ❌
                            </button>
                          </>

                        ) : (

                          /* DELETE */

                          <button
                            className="more-button"
                            title="Move to Trash"
                            onClick={() =>
                              handleDelete(
                                file.id
                              )
                            }
                          >
                            ⋮
                          </button>

                        )}

                      </div>

                    </div>

                    <h3
                      className="file-name"
                      title={
                        file.fileName
                      }
                    >
                      {file.fileName}
                    </h3>

                    <div className="file-meta">

                      <span>
                        {formatFileSize(
                          file.fileSize
                        )}
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        {file.uploadedAt
                          ? new Date(
                              file.uploadedAt
                            ).toLocaleDateString()
                          : "Unknown date"}
                      </span>

                    </div>

                    <div className="card-actions">

                      {/* DOWNLOAD */}

                      <button
                        className="download-button"
                        onClick={() =>
                          handleDownload(
                            file
                          )
                        }
                      >
                        ⬇ Download
                      </button>

                      {/* SHARE */}
                      {activeMenu !== "Trash" && (
                        <button
                          className="share-button"
                          onClick={() => handleShare(file)}
                          disabled={loading}
                          title="Create share link"
                        >
                          🔗 Share
                        </button>
                      )}

                      {/* STAR */}

                      <button
                        className="delete-button"
                        title={
                          file.starred
                            ? "Unstar"
                            : "Star"
                        }
                        onClick={() =>
                          handleToggleStar(
                            file
                          )
                        }
                        style={{
                          fontSize:
                            "18px",
                        }}
                      >
                        {file.starred
                          ? "★"
                          : "☆"}
                      </button>

                      {/* TRASH ACTIONS */}

                      {activeMenu ===
                      "Trash" ? (

                        <>
                          <button
                            className="delete-button"
                            title="Restore"
                            onClick={() =>
                              handleRestore(
                                file.id
                              )
                            }
                          >
                            ♻️
                          </button>

                          <button
                            className="delete-button"
                            title="Permanently Delete"
                            onClick={() =>
                              handlePermanentDelete(
                                file.id
                              )
                            }
                          >
                            ❌
                          </button>
                        </>

                      ) : (

                        /* DELETE */

                        <button
                          className="delete-button"
                          title="Move to Trash"
                          onClick={() =>
                            handleDelete(
                              file.id
                            )
                          }
                        >
                          🗑️
                        </button>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            /* =================================================
               LIST VIEW
            ================================================= */

            <div className="list-container">

              {filteredFiles.map(
                (file) => (

                  <div
                    key={file.id}
                    className="list-item"
                  >

                    <div className="list-file-icon">
                      {getFileIcon(
                        file.fileName
                      )}
                    </div>

                    <div className="list-file-info">

                      <strong>
                        {file.fileName}
                      </strong>

                      <small>
                        {formatFileSize(
                          file.fileSize
                        )}
                      </small>

                    </div>

                    <div className="list-date">

                      {file.uploadedAt
                        ? new Date(
                            file.uploadedAt
                          ).toLocaleString()
                        : "Unknown date"}

                    </div>

                    {/* STAR */}

                    <button
                      className="list-download"
                      onClick={() =>
                        handleToggleStar(
                          file
                        )
                      }
                      title={
                        file.starred
                          ? "Remove from Starred"
                          : "Add to Starred"
                      }
                      style={{
                        color:
                          file.starred
                            ? "#f5b301"
                            : "#999",
                        fontSize:
                          "20px",
                      }}
                    >
                      {file.starred
                        ? "★"
                        : "☆"}
                    </button>

                    {/* DOWNLOAD */}

                    <button
                      className="list-download"
                      onClick={() =>
                        handleDownload(
                          file
                        )
                      }
                      title="Download"
                    >
                      ⬇
                    </button>

                    {/* SHARE */}
                    {activeMenu !== "Trash" && (
                      <button
                        className="list-download share-list-button"
                        onClick={() => handleShare(file)}
                        disabled={loading}
                        title="Create share link"
                      >
                        🔗
                      </button>
                    )}

                    {/* TRASH / NORMAL DELETE */}

                    {activeMenu ===
                    "Trash" ? (

                      <>
                        <button
                          className="list-download"
                          onClick={() =>
                            handleRestore(
                              file.id
                            )
                          }
                          title="Restore"
                        >
                          ♻️
                        </button>

                        <button
                          className="list-delete"
                          onClick={() =>
                            handlePermanentDelete(
                              file.id
                            )
                          }
                          title="Permanently Delete"
                        >
                          ❌
                        </button>
                      </>

                    ) : (

                      <button
                        className="list-delete"
                        onClick={() =>
                          handleDelete(
                            file.id
                          )
                        }
                        title="Move to Trash"
                      >
                        🗑️
                      </button>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =================================================
            SHARE MODAL
        ================================================= */}
        {showShareModal && (
          <div
            className="share-overlay"
            onClick={() => setShowShareModal(false)}
          >
            <div
              className="share-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="share-close"
                onClick={() => setShowShareModal(false)}
                title="Close"
              >
                ×
              </button>

              <div className="share-modal-icon">🔗</div>
              <h2>Share File</h2>
              <p className="share-file-name">
                {shareFile?.fileName}
              </p>

              <input
                type="text"
                value={shareLink}
                readOnly
                onFocus={(event) => event.target.select()}
              />

              <div className="share-actions">
                <button
                  className="share-copy-button"
                  onClick={copyShareLink}
                >
                  📋 Copy Link
                </button>

                <button
                  className="share-close-button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareFile(null);
                    setShareLink("");
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

export default Dashboard;
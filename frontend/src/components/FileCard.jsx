function FileCard({

  file,

  onDownload,

  onDelete,

}) {

  return (

    <div className="file-card">

      <h3>📄 {file.fileName}</h3>

      <p>

        {(file.fileSize / 1024)

          .toFixed(2)} KB

      </p>

      <div className="actions">

        <button

          onClick={() =>

            onDownload(file)

          }

        >

          ⬇ Download

        </button>

        <button

          onClick={() =>

            onDelete(file.id)

          }

        >

          🗑 Delete

        </button>

      </div>

    </div>

  );

}

export default FileCard;
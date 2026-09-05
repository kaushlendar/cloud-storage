function UploadBox({

  selectedFile,

  setSelectedFile,

  handleUpload,

  loading,

}) {

  return (

    <div className="upload-box">

      <h3>⬆ Upload File</h3>

      <input

        type="file"

        onChange={(e) =>

          setSelectedFile(

            e.target.files[0]

          )

        }

      />

      <br />

      <br />

      <button

        onClick={handleUpload}

      >

        {loading

          ? "Uploading..."

          : "Upload"}

      </button>

      {selectedFile && (

        <p>

          Selected:

          {selectedFile.name}

        </p>

      )}

    </div>

  );

}

export default UploadBox;
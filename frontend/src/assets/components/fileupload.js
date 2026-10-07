import { useRef, useState } from "react";
import { Button } from "react-bootstrap";
import "../../Styling/fileupload.css";

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg"];

export default function FileUpload({ file, onChange, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pick = (f) => {
    if (f && ACCEPTED.includes(f.type)) onChange(f);
  };

  return (
    <div>
      <div
        className={`regplayerUploadFile ${dragging ? "regplayerUploadDragFile" : ""} ${error ? "regplayerUploadErrorFile" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          hidden
          onChange={(e) => pick(e.target.files[0])}
        />
        <Button variant="light" size="sm" type="button" onClick={() => inputRef.current.click()}>
          Upload
        </Button>
        <p className="regplayerUploadHintFile">
          {file ? file.name : "Choose a file or drag & drop it here"}
        </p>
      </div>
      {error && <div className="regplayerUploadErrorMessageFile">{error}</div>}
    </div>
  );
}
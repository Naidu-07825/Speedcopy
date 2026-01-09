import "./PrintOrder.css";
import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker?url";
import { calculatePrintPrice } from "../utils/priceCalculator";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PrintOrder() {
  const [pages, setPages] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filePages, setFilePages] = useState({}); 

  const [form, setForm] = useState({
    copies: 1,
    color: "bw",
    sides: "single",
    size: "A4",
    binding: "none",
    lamination: false,
    urgent: false,
    distanceKm: 0,
  });

 
  const price =
    pages > 0 ? calculatePrintPrice({ pages, ...form }) : 0;

  
  useEffect(() => {
    try {
      const storedFiles = JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
      if (storedFiles.length > 0) {
        setUploadedFiles(storedFiles);
        
        const totalPages = storedFiles.reduce((sum, file) => sum + (file.pages || 0), 0);
        setPages(totalPages);
        
        const pagesMap = {};
        storedFiles.forEach((file) => {
          pagesMap[file.name] = file.pages || 0;
        });
        setFilePages(pagesMap);
      }
    } catch (err) {
      console.warn("Failed to load stored files", err);
    }
  }, []);

  
  const handlePdfUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const newFiles = [];
    const pagesMap = { ...filePages };
    let totalPages = pages;

    
    for (const file of selectedFiles) {
      try {
       
        const pageCount = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const typedArray = new Uint8Array(reader.result);
              const pdf = await pdfjsLib.getDocument(typedArray).promise;
              resolve(pdf.numPages);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });

       
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const fileInfo = {
          name: file.name,
          type: file.type,
          dataUrl: dataUrl,
          pages: pageCount,
        };

        newFiles.push(fileInfo);
        pagesMap[file.name] = pageCount;
        totalPages += pageCount;
      } catch (err) {
        console.error(`Failed to process file ${file.name}:`, err);
        alert(`Failed to process ${file.name}. Please try again.`);
      }
    }

    
    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    setFilePages(pagesMap);
    setPages(totalPages);

    
    try {
      localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));
    } catch (err) {
      console.warn("Failed to store uploaded files in localStorage", err);
    }

    
    e.target.value = "";
  };

  const removeStoredFile = (index) => {
    const fileToRemove = uploadedFiles[index];
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    const updatedPagesMap = { ...filePages };
    delete updatedPagesMap[fileToRemove.name];

    setUploadedFiles(updatedFiles);
    setFilePages(updatedPagesMap);
    setPages(pages - (fileToRemove.pages || 0));

    
    if (updatedFiles.length === 0) {
      localStorage.removeItem("uploadedFiles");
    } else {
      localStorage.setItem("uploadedFiles", JSON.stringify(updatedFiles));
    }
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setFilePages({});
    setPages(0);
    localStorage.removeItem("uploadedFiles");
  };

  
  const addToCart = () => {
    if (uploadedFiles.length === 0 || pages === 0) {
      alert("Please upload at least one valid PDF first");
      return;
    }

    const unitprice = price / form.copies;

    const cartItem = {
      id: Date.now(),

      
      service: "Xerox",

      
      pages,
      copies: form.copies,
      unitprice,
      price,

      color: form.color,
      sides: form.sides,
      size: form.size,
      binding: form.binding,
      lamination: form.lamination,
      urgent: form.urgent,
      distanceKm: form.distanceKm,
    };

    const existingCart =
      JSON.parse(localStorage.getItem("cart")) || [];

    const updatedCart = Array.isArray(existingCart)
      ? [...existingCart, cartItem]
      : [cartItem];

    localStorage.setItem("cart", JSON.stringify(updatedCart));

    
    setForm({
      copies: 1,
      color: "bw",
      sides: "single",
      size: "A4",
      binding: "none",
      lamination: false,
      urgent: false,
      distanceKm: 0,
    });

    alert(`✅ Xerox order added to cart (${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''})`);
  };

  return (
    <div className="print-container">
      <div className="print-card">
        <h2 className="print-title">📄 Upload & Configure Print</h2>

        <label>Upload PDF(s) - Multiple files allowed</label>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handlePdfUpload}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {pages > 0 && (
          <p className="page-count">
            Total pages detected: <b>{pages}</b> from <b>{uploadedFiles.length}</b> file{uploadedFiles.length > 1 ? 's' : ''}
          </p>
        )}

        
        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: 15, marginBottom: 15 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h5 style={{ margin: 0 }}>Uploaded Files:</h5>
              <button 
                className="btn btn-sm btn-outline-danger" 
                onClick={clearAllFiles}
              >
                Clear All
              </button>
            </div>
            <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}>
              {uploadedFiles.map((file, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "8px",
                    marginBottom: "5px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px"
                  }}
                >
                  <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "10px" }}>
                    <span style={{ fontWeight: "500" }}>{file.name}</span>
                    <span style={{ color: "#666", marginLeft: "8px", fontSize: "0.9em" }}>
                      ({file.pages || 0} page{file.pages !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => removeStoredFile(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid">
          <input
            type="number"
            min="1"
            value={form.copies}
            onChange={(e) =>
              setForm({ ...form, copies: +e.target.value })
            }
          />

          <select
            value={form.color}
            onChange={(e) =>
              setForm({ ...form, color: e.target.value })
            }
          >
            <option value="bw">Black & White</option>
            <option value="color">Color</option>
          </select>

          <select
            value={form.sides}
            onChange={(e) =>
              setForm({ ...form, sides: e.target.value })
            }
          >
            <option value="single">Single Side</option>
            <option value="double">Double Side</option>
          </select>

          <select
            value={form.size}
            onChange={(e) =>
              setForm({ ...form, size: e.target.value })
            }
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
          </select>

          <select
            value={form.binding}
            onChange={(e) =>
              setForm({ ...form, binding: e.target.value })
            }
          >
            <option value="none">None</option>
            <option value="spiral">Spiral (+₹30)</option>
            <option value="staple">Staple (+₹45)</option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Delivery distance (km)"
            value={form.distanceKm}
            onChange={(e) =>
              setForm({ ...form, distanceKm: +e.target.value })
            }
          />
        </div>

        <label>
          <input
            type="checkbox"
            checked={form.lamination}
            onChange={(e) =>
              setForm({ ...form, lamination: e.target.checked })
            }
          />
          Lamination (+₹30)
        </label>

        <label>
          <input
            type="checkbox"
            checked={form.urgent}
            onChange={(e) =>
              setForm({ ...form, urgent: e.target.checked })
            }
          />
          Urgent Print (+₹50)
        </label>

        <div className="price-box">
          💰 Total Price: ₹{price}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="add-btn" onClick={addToCart}>
            ➕ Add to Cart
          </button>

          <button
            className="btn btn-outline-primary w-100"
            onClick={() => (window.location.href = "/cart")}
          >
            🛒 Go to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import backendUrl from "../backend.js";
export default function DiseasesDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setResult(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function simulateDetection() {
    // Backwards-compatible: if you want to simulate locally, keep original behavior
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 700));
      const name = (file.name || "").toLowerCase();
      let detection = { detected_diseases: [] };
      if (name.includes("rust") || Math.random() < 0.25) {
        detection = { detected_diseases: ["Wheat Rust"] };
      } else if (name.includes("blast") || Math.random() < 0.18) {
        detection = { detected_diseases: ["Rice Blast"] };
      } else {
        detection = { detected_diseases: [] };
      }
      setResult(detection);
    } catch (err) {
      setError("Simulation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDetect() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/disease`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = await res.json();
      // Expecting { detected_diseases: ["Corn leaf blight"] }
      setResult(data);
      // Persist activity to localStorage so Overview can pick it up even if not mounted
      try {
        const title =
          data.detected_diseases && data.detected_diseases.length
            ? `Detected: ${data.detected_diseases.join(", ")}`
            : "Disease scan completed";
        const subtitle =
          data.detected_diseases && data.detected_diseases.length
            ? `Found ${data.detected_diseases.length} disease(s)`
            : "No diseases detected";
        const item = {
          id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          title,
          subtitle,
          timestamp: Date.now(),
        };
        try {
          const raw = localStorage.getItem("recentActivities");
          const arr = raw ? JSON.parse(raw) : [];
          const next = [item, ...arr].slice(0, 10);
          localStorage.setItem("recentActivities", JSON.stringify(next));
        } catch (e) {
          // ignore storage errors
        }
      } catch (e) {}
      // Dispatch activity so Overview can pick it up
      try {
        const title =
          data.detected_diseases && data.detected_diseases.length
            ? `Detected: ${data.detected_diseases.join(", ")}`
            : "Disease scan completed";
        const subtitle =
          data.detected_diseases && data.detected_diseases.length
            ? `Found ${data.detected_diseases.length} disease(s)`
            : "No diseases detected";
        const evtDetail = { title, subtitle };
        try {
          window.dispatchEvent(
            new CustomEvent("activityAdded", { detail: evtDetail })
          );
        } catch (e) {
          const evt = document.createEvent("CustomEvent");
          evt.initCustomEvent("activityAdded", true, true, evtDetail);
          window.dispatchEvent(evt);
        }
      } catch (e) {
        // ignore dispatch errors
      }
    } catch (err) {
      console.error("Detection failed", err);
      setError(err.message || "Detection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Disease Detection</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium mb-3">Upload Plant Image</h3>

          <label className="block text-sm text-gray-600 mb-2">
            Plant Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-3"
          />

          <p className="text-xs text-gray-500 mb-3">
            Upload a clear image of the plant leaves or affected area.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDetect}
              disabled={!file || loading}
              className={`bg-blue-600 text-white rounded px-4 py-2 ${
                !file || loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Detecting…" : "Detect Disease"}
            </button>
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setResult(null);
                setError(null);
              }}
              className="text-sm text-gray-600"
            >
              Clear
            </button>
          </div>

          {preview && (
            <div className="mt-4 border rounded overflow-hidden">
              <img
                src={preview}
                alt="preview"
                className="w-full object-cover max-h-64"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium mb-3">Detection Results</h3>

          {!result ? (
            <div className="text-sm text-gray-500">
              Upload an image to detect plant diseases.
            </div>
          ) : result.detected_diseases && result.detected_diseases.length ? (
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold text-lg">Detected Diseases</div>
              <ul className="mt-2 space-y-2">
                {result.detected_diseases.map((d, i) => (
                  <li
                    key={i}
                    className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold text-lg">No diseases detected</div>
              <div className="text-sm text-gray-700 mt-1">
                The image did not match known disease patterns.
              </div>
            </div>
          )}
          {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-medium mb-3">Common Plant Diseases</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="py-2">Disease</th>
                <th className="py-2">Symptoms</th>
                <th className="py-2">Treatment</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-3">Wheat Rust</td>
                <td className="py-3">Orange-brown pustules on leaves</td>
                <td className="py-3">
                  Apply fungicide and maintain proper spacing
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-3">Rice Blast</td>
                <td className="py-3">Diamond-shaped lesions on leaves</td>
                <td className="py-3">
                  Use resistant varieties and proper water management
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

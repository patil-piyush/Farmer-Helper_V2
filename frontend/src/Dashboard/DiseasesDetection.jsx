import React, { useState } from "react";

export default function DiseasesDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

  function simulateDetection() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    // fake async detection: choose result based on filename keywords
    setTimeout(() => {
      const name = (file.name || "").toLowerCase();
      let detection = {
        label: "No disease detected",
        confidence: 0.98,
        advice: "Plant appears healthy.",
      };
      if (name.includes("rust") || Math.random() < 0.25) {
        detection = {
          label: "Wheat Rust",
          confidence: 0.86,
          advice: "Apply fungicide and maintain proper spacing.",
        };
      } else if (name.includes("blast") || Math.random() < 0.18) {
        detection = {
          label: "Rice Blast",
          confidence: 0.79,
          advice: "Use resistant varieties and proper water management.",
        };
      }

      setResult(detection);
      setLoading(false);
    }, 800);
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

          <button
            onClick={simulateDetection}
            disabled={!file || loading}
            className={`bg-blue-600 text-white rounded px-4 py-2 ${
              !file || loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Detecting…" : "Detect Disease"}
          </button>

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
          ) : (
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold text-lg">{result.label}</div>
              <div className="text-sm text-gray-700 mt-1">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-700 mt-2">
                Recommendation: {result.advice}
              </div>
            </div>
          )}
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

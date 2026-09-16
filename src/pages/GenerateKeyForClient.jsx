import React, { useState, useEffect } from "react";
import { clientApi } from "../api/api";
import { useToast } from "../contexts/ToastContext";

const GenerateKeyForClient = () => {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatedKeyResult, setGeneratedKeyResult] = useState(null);

  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    description: "",
    environment: "staging",
  });

  const toastContext = useToast();
  // Safe helper to handle different toast hook implementations
  const notify = (msg, type) => {
    if (typeof toastContext?.showToast === "function") {
      toastContext.showToast(msg, type);
    } else if (typeof toastContext?.addToast === "function") {
      toastContext.addToast(msg, type);
    } else if (typeof toastContext === "function") {
      toastContext(msg);
    } else {
      console.log(`[${type.toUpperCase()}] ${msg}`);
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientApi.getClients();
        setClients(response.data || response);
      } catch (error) {
        notify("Failed to load clients list", "error");
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId) {
      notify("Please select a client", "error");
      return;
    }

    setSubmitting(true);
    setGeneratedKeyResult(null);

    try {
      const response = await clientApi.createApiKey(formData.clientId, {
        name: formData.name,
        description: formData.description,
        environment: formData.environment,
      });

      const keyData = response.data || response;
      setGeneratedKeyResult(keyData);
      notify("API Key generated successfully!", "success");

      setFormData((prev) => ({
        ...prev,
        name: "",
        description: "",
        environment: "staging",
      }));
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to generate API key";
      notify(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notify("API key copied to clipboard!", "success");
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "24px",
        background: "var(--card-bg, #fff)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>Generate API Key for Client</h2>
      <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>
        As a Super Admin, you can provision secondary or environment-specific
        API keys for any client.
      </p>

      {generatedKeyResult && (
        <div
          style={{
            background: "#e6f4ea",
            border: "1px solid #34a853",
            padding: "16px",
            borderRadius: "6px",
            marginBottom: "24px",
          }}
        >
          <h4 style={{ color: "#137333", margin: "0 0 8px 0" }}>
            ✓ Key Generated Successfully!
          </h4>
          <p
            style={{ fontSize: "13px", color: "#202124", marginBottom: "8px" }}
          >
            Copy this key now. For security reasons, it will not be shown again.
          </p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              readOnly
              value={generatedKeyResult.keyValue}
              style={{
                flex: 1,
                padding: "8px",
                fontFamily: "monospace",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button
              type="button"
              onClick={() => copyToClipboard(generatedKeyResult.keyValue)}
              style={{
                padding: "8px 16px",
                background: "#137333",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div>
          <label
            style={{ display: "block", fontWeight: "500", marginBottom: "6px" }}
          >
            Select Client *
          </label>
          {loadingClients ? (
            <p style={{ fontSize: "14px", color: "#666" }}>
              Loading clients...
            </p>
          ) : (
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">-- Choose a Client --</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label
            style={{ display: "block", fontWeight: "500", marginBottom: "6px" }}
          >
            Environment *
          </label>
          <select
            name="environment"
            value={formData.environment}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="staging">Staging</option>
            <option value="production">Production</option>
            <option value="development">Development</option>
            <option value="testing">Testing</option>
          </select>
        </div>

        <div>
          <label
            style={{ display: "block", fontWeight: "500", marginBottom: "6px" }}
          >
            Key Name *
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Staging Analytics Key"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{ display: "block", fontWeight: "500", marginBottom: "6px" }}
          >
            Description
          </label>
          <textarea
            name="description"
            placeholder="What is this key used for?"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "12px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          {submitting ? "Generating..." : "Generate API Key"}
        </button>
      </form>
    </div>
  );
};

export default GenerateKeyForClient;

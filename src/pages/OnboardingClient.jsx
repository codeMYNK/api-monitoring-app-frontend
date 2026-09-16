import React, { useState } from "react";
import api from "../api/api";
import {
  CheckCircle,
  AlertCircle,
  Key,
  Copy,
  Plus,
  UserPlus,
} from "lucide-react";

const OnboardingClient = () => {
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1);

  // Step 1 Form: Client App Details
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    description: "",
    website: "",
  });

  // Step 2 Form: Client Admin User Details
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Step 3 Form: API Key Details
  const [keyForm, setKeyForm] = useState({
    name: "",
    description: "",
    environment: "Production", // Default value
  });

  const [status, setStatus] = useState({ loading: false, error: null });

  // Result Data
  const [onboardedClient, setOnboardedClient] = useState(null);
  const [createdUser, setCreatedUser] = useState(null);
  const [generatedKey, setGeneratedKey] = useState(null);

  // --- HANDLERS ---
  const handleClientChange = (e) =>
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  const handleUserChange = (e) =>
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  const handleKeyChange = (e) =>
    setKeyForm({ ...keyForm, [e.target.name]: e.target.value });

  // STEP 1: Create Client
  const handleCreateClient = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      const response = await api.post("/admin/clients/onboard", clientForm);
      setOnboardedClient(response.data.data || response.data);

      // Pre-fill the user email with the client email to save time
      setUserForm((prev) => ({ ...prev, email: clientForm.email }));
      setStep(2);
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.message || "Failed to onboard client.",
      });
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  // STEP 2: Create Client Admin User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      const clientId = onboardedClient.id || onboardedClient._id;
      const payload = {
        ...userForm,
        role: "client_admin", // Force the role as per your requirement
      };

      const response = await api.post(
        `/admin/clients/${clientId}/users`,
        payload,
      );
      setCreatedUser(response.data.data || response.data);
      setStep(3);
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.message || "Failed to create admin user.",
      });
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  // STEP 3: Generate API Key
  const handleGenerateKey = async (e) => {
    e.preventDefault(); // Add this to prevent page reload on form submit
    setStatus({ loading: true, error: null });
    try {
      const clientId = onboardedClient.id || onboardedClient._id;

      // Use the dynamic keyForm state here instead of hardcoded values
      const response = await api.post(
        `/admin/clients/${clientId}/api/keys`,
        keyForm,
      );

      setGeneratedKey(response.data.data || response.data);
      setStep(4); // Final completion step
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.message || "Failed to generate API key.",
      });
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleReset = () => {
    setClientForm({ name: "", email: "", description: "", website: "" });
    setUserForm({ username: "", email: "", password: "" });
    setKeyForm({ name: "", description: "", environment: "Production" });
    setOnboardedClient(null);
    setCreatedUser(null);
    setGeneratedKey(null);
    setStatus({ loading: false, error: null });
    setStep(1);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // --- RENDER HELPERS ---
  const ErrorBanner = () =>
    status.error && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "#dc2626",
          backgroundColor: "#fee2e2",
          padding: "1rem",
          borderRadius: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <AlertCircle size={20} />
        <span>{status.error}</span>
      </div>
    );

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Onboard New Client
        </h2>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            color: "#666",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: step >= 1 ? "bold" : "normal",
              color: step >= 1 ? "#3b82f6" : "#9ca3af",
            }}
          >
            1. App Details
          </span>{" "}
          &rarr;
          <span
            style={{
              fontWeight: step >= 2 ? "bold" : "normal",
              color: step >= 2 ? "#3b82f6" : "#9ca3af",
            }}
          >
            2. Admin User
          </span>{" "}
          &rarr;
          <span
            style={{
              fontWeight: step >= 3 ? "bold" : "normal",
              color: step >= 3 ? "#3b82f6" : "#9ca3af",
            }}
          >
            3. API Key
          </span>
        </div>
      </div>

      <ErrorBanner />

      {/* STEP 1: CLIENT DETAILS */}
      {step === 1 && (
        <form
          onSubmit={handleCreateClient}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label style={{ fontWeight: "500" }}>Client Name *</label>
            <input
              type="text"
              name="name"
              value={clientForm.name}
              onChange={handleClientChange}
              required
              placeholder="e.g. Blinkit"
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label style={{ fontWeight: "500" }}>Contact Email *</label>
            <input
              type="email"
              name="email"
              value={clientForm.email}
              onChange={handleClientChange}
              required
              placeholder="e.g. blinkit@gmail.com"
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label style={{ fontWeight: "500" }}>Website</label>
            <input
              type="text"
              name="website"
              value={clientForm.website}
              onChange={handleClientChange}
              placeholder="e.g. blinkit.com"
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <label style={{ fontWeight: "500" }}>Description</label>
            <textarea
              name="description"
              value={clientForm.description}
              onChange={handleClientChange}
              rows="3"
              style={{
                padding: "0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={status.loading}
            style={{
              padding: "0.75rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              fontWeight: "500",
              cursor: status.loading ? "not-allowed" : "pointer",
            }}
          >
            {status.loading ? "Creating Client..." : "Next: Create Admin User"}
          </button>
        </form>
      )}

      {/* STEP 2: USER DETAILS */}
      {step === 2 && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
              color: "#16a34a",
            }}
          >
            <CheckCircle size={28} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>
              {onboardedClient.name} Onboarded
            </h3>
          </div>

          <form
            onSubmit={handleCreateUser}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "1.5rem",
            }}
          >
            <h4 style={{ margin: 0, color: "#374151" }}>
              Create Client Admin Account
            </h4>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label style={{ fontWeight: "500" }}>Username *</label>
              <input
                type="text"
                name="username"
                value={userForm.username}
                onChange={handleUserChange}
                required
                placeholder="mayank_in_blinkit"
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label style={{ fontWeight: "500" }}>Login Email *</label>
              <input
                type="email"
                name="email"
                value={userForm.email}
                onChange={handleUserChange}
                required
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label style={{ fontWeight: "500" }}>Temporary Password *</label>
              <input
                type="text"
                name="password"
                value={userForm.password}
                onChange={handleUserChange}
                required
                placeholder="Mayank#1234"
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={status.loading}
              style={{
                padding: "0.75rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                fontWeight: "500",
                cursor: status.loading ? "not-allowed" : "pointer",
              }}
            >
              {status.loading ? "Creating User..." : "Next: Generate API Key"}
            </button>
          </form>
        </div>
      )}

      {/* STEP 3 & 4: API KEY GENERATION & SUCCESS */}
      {step >= 3 && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
              color: "#16a34a",
            }}
          >
            <CheckCircle size={28} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: 0 }}>
              Client & Admin Setup Complete
            </h3>
          </div>

          <div
            style={{
              backgroundColor: "#f3f4f6",
              padding: "1rem",
              borderRadius: "0.375rem",
              marginBottom: "2rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 0.25rem 0",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                Client ID
              </p>
              <p style={{ margin: 0, fontWeight: "500" }}>
                {onboardedClient.id || onboardedClient._id}
              </p>
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 0.25rem 0",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                Admin Login
              </p>
              <p style={{ margin: 0, fontWeight: "500" }}>
                {createdUser?.email || userForm.email}
              </p>
            </div>
          </div>

          {step === 3 ? (
            <form
              onSubmit={handleGenerateKey}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "1.5rem",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Key
                  size={48}
                  color="#9ca3af"
                  style={{ margin: "0 auto 0.5rem" }}
                />
                <h4 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>
                  Final Step: Configure API Key
                </h4>
                <p style={{ color: "#666", margin: 0, fontSize: "0.875rem" }}>
                  Set up the details for the client's integration key.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label style={{ fontWeight: "500" }}>Key Name *</label>
                <input
                  type="text"
                  name="name"
                  value={keyForm.name}
                  onChange={handleKeyChange}
                  required
                  placeholder="e.g. Staging Environment Key"
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label style={{ fontWeight: "500" }}>Environment *</label>
                <select
                  name="environment"
                  value={keyForm.environment}
                  onChange={handleKeyChange}
                  required
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#fff",
                  }}
                >
                  <option value="Production">Production</option>
                  <option value="Staging">Staging</option>
                  <option value="Development">Development</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label style={{ fontWeight: "500" }}>Description</label>
                <textarea
                  name="description"
                  value={keyForm.description}
                  onChange={handleKeyChange}
                  rows="2"
                  placeholder="API Key for staging environment testing"
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={status.loading}
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontWeight: "500",
                  cursor: status.loading ? "not-allowed" : "pointer",
                  marginTop: "0.5rem",
                }}
              >
                {status.loading ? "Generating..." : "Generate API Key Now"}
              </button>
            </form>
          ) : (
            <div
              style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                padding: "1.5rem",
                borderRadius: "0.375rem",
                marginTop: "1rem",
              }}
            >
              <h4 style={{ color: "#1e3a8a", margin: "0 0 1rem 0" }}>
                Production API Key Generated
              </h4>
              <p
                style={{
                  color: "#1e40af",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
                Copy this key and provide it to the client securely. It will not
                be shown again.
              </p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <code
                  style={{
                    flex: 1,
                    backgroundColor: "#fff",
                    padding: "0.75rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #93c5fd",
                    wordBreak: "break-all",
                  }}
                >
                  {generatedKey.keyValue}
                </code>
                <button
                  onClick={() =>
                    copyToClipboard(generatedKey.keyValue)
                  }
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                  }}
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: "2rem", textAlign: "right" }}>
            <button
              onClick={handleReset}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "transparent",
                color: "#4b5563",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Plus size={16} /> Onboard Another Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingClient;

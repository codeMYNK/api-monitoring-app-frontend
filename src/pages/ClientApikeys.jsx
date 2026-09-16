import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi, clientApi } from "../api/api";
import { Key, Copy, AlertCircle, Check } from "lucide-react";

const ClientApiKeys = () => {
  const [copiedKey, setCopiedKey] = useState(null);

  // 1. Fetch the user profile to get their clientId
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  // Extract clientId depending on how your backend nests it (adjust if necessary)
  const clientId = profile?.data?.clientId || profile?.data?.client;

  // 2. Fetch the API keys for this specific client
  const {
    data: keysResponse,
    isLoading: isKeysLoading,
    error,
  } = useQuery({
    queryKey: ["apiKeys", clientId],
    queryFn: () => clientApi.getClientApiKeys(clientId),
    enabled: !!clientId, // Only run this query if we have a clientId
  });

  const apiKeys = keysResponse?.data || keysResponse || [];

  const handleCopy = (keyString) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKey(keyString);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isProfileLoading || (clientId && isKeysLoading)) {
    return (
      <div
        style={{ padding: "2rem", display: "flex", justifyContent: "center" }}
      >
        <p>Loading API Keys...</p>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div style={{ padding: "2rem", color: "#dc2626" }}>
        <AlertCircle style={{ display: "inline", marginRight: "0.5rem" }} />
        Error: No Client ID associated with your account.
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>API Keys</h2>
        <p style={{ color: "#666" }}>
          Use these keys to authenticate your application with the API Hit
          Monitoring System.
        </p>
      </div>

      {error && (
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
          <span>Failed to load API keys. Please try again later.</span>
        </div>
      )}

      {!apiKeys.length && !error ? (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "3rem 2rem",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <Key size={48} color="#9ca3af" style={{ margin: "0 auto 1rem" }} />
          <h3>No API Keys Found</h3>
          <p style={{ color: "#666" }}>
            Your super admin has not generated any API keys for your account
            yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {apiKeys.map((keyObj, index) => {

            // console.log("Full Key Object from backend:", keyObj);
            // Handle different possible backend response structures
            const keyString = keyObj.keyValue || keyObj.key || keyObj.apiKey;
            const keyName = keyObj.name || `API Key ${index + 1}`;
            const keyDate = keyObj.createdAt
              ? new Date(keyObj.createdAt).toLocaleDateString()
              : "Unknown date";

            return (
              <div
                key={keyObj.id || index}
                style={{
                  backgroundColor: "#fff",
                  padding: "1.5rem",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0", fontWeight: "bold" }}>
                      {keyName}
                    </h4>
                    <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      Created: {keyDate}
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    Active
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <code
                    style={{
                      flex: 1,
                      backgroundColor: "#f3f4f6",
                      padding: "0.75rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #e5e7eb",
                      wordBreak: "break-all",
                    }}
                  >
                    {keyString}
                  </code>
                  <button
                    onClick={() => handleCopy(keyString)}
                    style={{
                      padding: "0.75rem",
                      backgroundColor:
                        copiedKey === keyString ? "#10b981" : "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "0.25rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "background-color 0.2s",
                    }}
                    title="Copy to clipboard"
                  >
                    {copiedKey === keyString ? (
                      <Check size={20} />
                    ) : (
                      <Copy size={20} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientApiKeys;

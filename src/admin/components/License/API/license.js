const API_BASE = window.websacAdmin?.apiUrl || "/wp-json/";
const NONCE = window.websacAdmin?.nonce || "";

export const licenseService = {
  /**
   * Check license status
   * @return {Promise<Object>} License status data
   */
  async checkLicenseStatus() {
    try {
      const response = await fetch(`${API_BASE}one-accessibility/v1/license/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": NONCE,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check license status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("License status check error:", error);
      return {
        success: false,
        is_active: false,
        license_data: null,
        error_message: error.message,
      };
    }
  },

  /**
   * Activate license
   * @param {string} licenseKey - License key
   * @param {string} email      - User email
   * @return {Promise<Object>} Activation result
   */
  async activateLicense(licenseKey, email) {
    try {
      const response = await fetch(`${API_BASE}one-accessibility/v1/license/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": NONCE,
        },
        body: JSON.stringify({
          license_key: licenseKey,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Failed to activate license",
        };
      }

      return data;
    } catch (error) {
      console.error("License activation error:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  /**
   * Deactivate license
   * @return {Promise<Object>} Deactivation result
   */
  async deactivateLicense() {
    try {
      const response = await fetch(`${API_BASE}one-accessibility/v1/license/deactivate`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": NONCE,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Failed to deactivate license",
        };
      }

      return data;
    } catch (error) {
      console.error("License deactivation error:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  /**
   * Get license info
   * @return {Promise<Object>} License information
   */
  async getLicenseInfo() {
    try {
      const response = await fetch(`${API_BASE}one-accessibility/v1/license/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": NONCE,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null,
          message: data.message || "Failed to get license info",
        };
      }

      return data;
    } catch (error) {
      console.error("Get license info error:", error);
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  },
};

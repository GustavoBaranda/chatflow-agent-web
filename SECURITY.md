# Security Policy

## Supported Versions

`chatflow-agent-web` tracks active and supported releases of the `chatflow-agent` Python library. Security patches and updates are provided for the following versions:

| Version Track | Associated SDK Release | Supported | Notes |
| :--- | :--- | :---: | :--- |
| **`v0.3` (Stable)** | `0.3.4` | :white_check_mark: Yes | Current production documentation baseline |
| **`v0.4` (Prerelease)** | `0.4.0rc1` | :white_check_mark: Yes | Active development and release candidate track |
| `< 0.3.0` | Legacy releases | :x: No | Unsupported; upgrade to `0.3.4` or later |

---

## Reporting a Vulnerability

The maintainers of `chatflow-agent-web` take the security of our platform, user data, and the Python SDK ecosystem seriously. If you discover a security vulnerability, we appreciate your help in disclosing it responsibly.

### How to Report Privately

1. **GitHub Security Advisory (Preferred):**  
   If you have access to the repository on GitHub, please submit a report through the **Security** tab using **Report a vulnerability** (Private Vulnerability Reporting).

2. **Direct Maintainer Contact:**  
   If GitHub Private Vulnerability Reporting is unavailable, you may reach out directly to the project creator and lead maintainer via their verified GitHub profile:  
   **Gustavo Baranda** ([@GustavoBaranda](https://github.com/GustavoBaranda))

### What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:
- A detailed description of the vulnerability and its potential security impact.
- Clear step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
- The affected component, file, route, or dependency.
- Any suggested fixes or remediations, if available.

### Please Do Not:
- **Do NOT open a public issue** on GitHub containing vulnerability details, exploit scripts, or sensitive vectors.
- Do NOT share or publish details about an unpatched vulnerability with third parties before it has been addressed.

---

## Response & Disclosure Process

1. **Acknowledgment:** We aim to acknowledge receipt of your vulnerability report within 48 to 72 business hours.
2. **Assessment:** The maintainers will investigate the report, verify the severity, and confirm the affected components.
3. **Remediation:** A patch will be developed, tested, and reviewed in a private security branch.
4. **Coordinated Disclosure:** Once the fix is released, public release notes and security advisories will be published, with appropriate credit given to the reporter (unless anonymity is requested).

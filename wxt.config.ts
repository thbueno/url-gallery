import { defineConfig } from "wxt"

// Public half of the extension's signing key. Used only in production builds so
// a real install gets a stable extension ID; dev builds keep their own
// path-based ID (and separate data) so they never collide with an installed copy.
const PRODUCTION_PUBLIC_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx+Gur2R28tVgelhpMI10Z/ud5Ry7H3RmwlPE3j6INOIM09yiGRXesGO3rIvkKtHoMnV5E6O0ZF+3MZPxYkGdB8iM15jVLHFAcj1dIvgaiH4+EIXgi1EW4x/9kQf4jbMSFcJtpwYOUL8vt1ryq5sLNwR1++UB6lIVjSaduykZ3A/Te0Jaods+VXOiwKPwsA7Mfx5y63IGK6zcGBCry3aMblWec9Dz52RN1nf4fjyoz+f9pPSelIYzQaJdc9p7pdLuf+yUcLpFxy/Rxx5aexb8WCS3SFwFg0ZW1b+vcbYoeO5krxZmk+p8UokUDy4oYlbV6MdBRBZPEGv7SVwqYvjSyQIDAQAB"

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  manifest: ({ mode }) => ({
    name: mode === "development" ? "DEV | URL Gallery" : "URL Gallery",
    description: "A visual gallery of fav-clicked sites",
    permissions: ["storage", "tabs", "scripting", "activeTab"],
    optional_host_permissions: ["https://*/*"],
    ...(mode === "production" ? { key: PRODUCTION_PUBLIC_KEY } : {}),
  }),
})

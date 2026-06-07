# Use Plasmo as the extension build framework

**Status:** accepted

Building a Manifest V3 extension with a raw bundler (Vite/webpack) requires hand-managing the manifest, service-worker entry points, content-script injection, HMR quirks, and the MV3 service-worker reload loop. Plasmo abstracts all of this — it generates the manifest from code, provides out-of-the-box React support, and handles service-worker live-reloading during development.

We accept the lock-in trade-off: Plasmo's abstractions can fight you at the edges (fine-grained offscreen/permissions manifest fields, unusual entry points). If we hit a case where Plasmo's generated manifest conflicts with a required permission or entry-point shape, we may need to eject or patch the manifest. That risk is low for the v1 scope (no offscreen document, standard permissions) and the DX savings outweigh it.

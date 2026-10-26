# Third-party software

WorkPulse's original source is MIT licensed; see LICENSE. That license does not
replace the licenses or terms of third-party dependencies, models or services.

- Next.js, React and React DOM: MIT licensed. Versions are pinned in package-lock.json.
- MediaPipe Tasks Vision: see the installed package's license and upstream
  https://github.com/google-ai-edge/mediapipe . Optional camera mode downloads
  its WASM runtime and pose model from their upstream hosts; core Timing Lab
  and manual movement flows do not require these downloads.
- Geist: font supplied through next/font; see upstream font license at
  https://github.com/vercel/geist-font .
- Devpost Learn Skill Pack: provenance and original notices remain in
  .agents/skills/ and skills-lock.json. These materials are supplied by
  https://github.com/challengepost/learn-ai-basics and are not newly authored
  WorkPulse source. The upstream MIT copyright and permission notice is included
  verbatim in [public/LICENSE-DEVPOST-LEARN.txt](public/LICENSE-DEVPOST-LEARN.txt),
  retrieved from the upstream LICENSE on 26 October 2026.

Dependency authors retain their original rights and notices. Dependency license texts were collected from the locked installation and linked upstream sources in public/third-party-licenses.txt. Runtime dependencies
retain their original licenses; Next standalone tracing does not copy every license file automatically. The public notice bundle is copied with public assets. This file
records attribution; it is not a claim of a complete legal audit.

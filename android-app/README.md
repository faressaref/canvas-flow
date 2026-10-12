# CanvasFlow Android APK

This folder contains the Capacitor wrapper for the Android build.

## Build

The GitHub Actions workflow `.github/workflows/build-android-apk.yml` generates a debug APK and uploads it as the `CanvasFlow-debug-apk` workflow artifact.

## Notes before a public release

- The APK packages the web UI and the core drawing libraries locally, so the editor shell can open without a network connection.
- Firebase authentication and cloud sync require a network connection.
- AI transcription and study tools require the deployed `/api/study` endpoint. For a packaged APK, configure the deployed API base URL before treating AI as ready.
- Local/offline board persistence must be validated on a real Android device before claiming full offline support.
- This is a debug APK for testing, not a signed Play Store release.

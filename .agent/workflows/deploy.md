---
description: Build and Deploy Android APK
---

# Deploy to Android

Follow these steps to generate an APK file that you can install on your Android device.

1.  **Install EAS CLI** (if not already installed)
    ```powershell
    npm install -g eas-cli
    ```

2.  **Log in to Expo**
    ```powershell
    eas login
    ```

3.  **Build the APK**
    ```powershell
    eas build --platform android --profile preview
    ```

4.  **Install**
    *   Wait for the build to finish.
    *   Click the link provided in the terminal (or scan the QR code).
    *   Download and install the `.apk` file on your phone.

# Converty (Expo)

Offline-first file conversion playground built with React Native + Expo. Supports image, audio, video, PDF, and text conversions using on-device libraries.

## Getting Started

### Prereqs
- Node.js 18+
- Expo CLI (`npm install -g expo`)
- Android Studio (with SDK + emulator) and/or Xcode + iOS Simulator
- EAS CLI (`npm install -g eas-cli`) for creating the dev client required by FFmpeg

### Install dependencies
```bash
npm install
```

### Configure native build (one-time)
FFmpeg support requires a development build (managed Expo Go cannot load native FFmpeg).

```bash
eas build:configure
expo prebuild --clean
expo run:android   # or expo run:ios
```

Subsequent launches can use `npx expo start --dev-client` once the development build is installed on the device.

### Run in development
```bash
npx expo start --dev-client
```

Scan the QR code with the Expo Dev Client on your device, or press `i` / `a` to launch the simulator/emulator.

## Features
- File picker for any format (via `expo-document-picker`)
- Queue-based conversion pipeline with live progress
- Image conversions (JPEG/PNG/WebP) using `expo-image-manipulator`
- Audio/video conversions via `ffmpeg-kit-react-native`
- Text conversions (TXT/CSV/JSON) in pure TypeScript
- PDF assembly from images using `pdf-lib`

PDF splitting and PDF-to-image conversion are stubbed; extend `runConversion` for production needs.

All jobs run entirely on the device. The cache directory `FileSystem.cacheDirectory/converty` stores outputs.

test
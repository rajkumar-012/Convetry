import type { DocumentPickerAsset } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { PDFDocument } from 'pdf-lib';
import { Platform } from 'react-native';
import { decode as atob } from 'base-64';

import type { ConversionRequest, ConversionResult } from '../types';

export type ProgressHandler = (value: number) => void;

const CACHE_DIR = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}converty/`;

async function ensureCacheDir() {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

function buildOutputPath(sourceName: string, targetExt: string) {
  const safeName = sourceName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const base = safeName.includes('.') ? safeName.substring(0, safeName.lastIndexOf('.')) : safeName;
  return `${CACHE_DIR}${base}_${Date.now()}.${targetExt}`;
}

export async function runConversion(
  request: ConversionRequest,
  onProgress?: ProgressHandler,
): Promise<ConversionResult> {
  await ensureCacheDir();
  onProgress?.(5);

  switch (request.category) {
    case 'image':
      return convertImage(request, onProgress);
    case 'audio':
      return convertMedia(request, onProgress);
    case 'video':
      return convertMedia(request, onProgress);
    case 'pdf':
      return convertPdf(request, onProgress);
    case 'text':
    default:
      return convertText(request, onProgress);
  }
}

async function convertImage(
  request: ConversionRequest,
  onProgress?: ProgressHandler,
): Promise<ConversionResult> {
  const format = mapImageFormat(request.targetFormat);
  if (!format) {
    return { success: false, error: `Unsupported image target: ${request.targetFormat}` };
  }

  onProgress?.(20);
  const result = await ImageManipulator.manipulateAsync(
    request.sourceUri,
    [],
    {
      format,
      compress: typeof request.parameters?.quality === 'number'
        ? (request.parameters?.quality as number) / 100
        : 0.85,
    },
  );

  onProgress?.(70);
  const targetExt = request.targetFormat.toLowerCase();
  const outputPath = buildOutputPath(request.sourceName, targetExt);
  await FileSystem.copyAsync({ from: result.uri, to: outputPath });
  onProgress?.(100);

  return { success: true, outputUri: outputPath };
}

async function convertMedia(
  request: ConversionRequest,
  onProgress?: ProgressHandler,
): Promise<ConversionResult> {
  onProgress?.(100);
  return {
    success: false,
    error: `Audio/video conversion requires FFmpeg setup. Install a compatible FFmpeg package (e.g., expo-ffmpeg-kit) and configure it in the conversion service.`,
  };
}

async function convertPdf(
  request: ConversionRequest,
  onProgress?: ProgressHandler,
): Promise<ConversionResult> {
  if (request.targetFormat === 'images') {
    return { success: false, error: 'PDF to images pipeline not wired in boilerplate.' };
  }

  if (request.targetFormat === 'split') {
    return { success: false, error: 'PDF split pipeline not wired in boilerplate.' };
  }

  const images = request.parameters?.images as DocumentPickerAsset[] | undefined;
  if (!images || images.length === 0) {
    return { success: false, error: 'No images supplied for PDF creation.' };
  }

  const pdfDoc = await PDFDocument.create();
  let processed = 0;

  for (const asset of images) {
    if (!asset.uri) {
      continue;
    }
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const imageBytes = base64ToUint8Array(base64);
    const embeddedImage = await pdfDoc.embedPng(imageBytes);
    const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    });
    processed += 1;
    onProgress?.(Math.round((processed / images.length) * 90));
  }

  const pdfBytes = await pdfDoc.saveAsBase64();
  const outputPath = buildOutputPath(request.sourceName, 'pdf');
  await FileSystem.writeAsStringAsync(outputPath, pdfBytes, {
    encoding: FileSystem.EncodingType.Base64,
  });
  onProgress?.(100);

  return { success: true, outputUri: outputPath };
}

async function convertText(
  request: ConversionRequest,
  onProgress?: ProgressHandler,
): Promise<ConversionResult> {
  const input = await FileSystem.readAsStringAsync(request.sourceUri);
  onProgress?.(25);

  let output = input;
  switch (request.targetFormat.toLowerCase()) {
    case 'csv':
      output = textToCsv(input);
      break;
    case 'json':
      output = textToJson(input);
      break;
    case 'txt':
    default:
      output = input;
  }

  onProgress?.(75);
  const outputPath = buildOutputPath(request.sourceName, request.targetFormat);
  await FileSystem.writeAsStringAsync(outputPath, output, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  onProgress?.(100);

  return { success: true, outputUri: outputPath };
}

function mapImageFormat(target: string): ImageManipulator.SaveFormat | null {
  switch (target.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return ImageManipulator.SaveFormat.JPEG;
    case 'png':
      return ImageManipulator.SaveFormat.PNG;
    case 'webp':
      return Platform.OS === 'android'
        ? ImageManipulator.SaveFormat.WEBP
        : ImageManipulator.SaveFormat.JPEG;
    default:
      return null;
  }
}

function textToCsv(content: string): string {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/).join(','))
    .join('\n');
}

function textToJson(content: string): string {
  const rows = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return JSON.stringify(rows.map((value, index) => ({ id: index + 1, value })), null, 2);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const length = binary.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}


import { ConversionDescriptor } from '../types';

export const CONVERSION_MATRIX: ConversionDescriptor[] = [
  {
    label: 'Image',
    category: 'image',
    defaultTarget: 'jpg',
    supportedTargets: ['jpg', 'png', 'webp'],
    extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp'],
  },
  {
    label: 'Audio',
    category: 'audio',
    defaultTarget: 'wav',
    supportedTargets: ['mp3', 'wav', 'aac', 'ogg'],
    extensions: ['mp3', 'wav', 'aac', 'm4a', 'ogg'],
  },
  {
    label: 'Video',
    category: 'video',
    defaultTarget: 'mp4',
    supportedTargets: ['mp4', 'webm', 'gif'],
    extensions: ['mp4', 'mov', 'mkv', 'webm'],
  },
  {
    label: 'PDF',
    category: 'pdf',
    defaultTarget: 'pdf',
    supportedTargets: ['pdf', 'images', 'split'],
    extensions: ['pdf'],
  },
  {
    label: 'Text',
    category: 'text',
    defaultTarget: 'txt',
    supportedTargets: ['txt', 'csv', 'json'],
    extensions: ['txt', 'csv', 'json', 'md'],
  },
];

export const inferDescriptor = (extension: string): ConversionDescriptor => {
  const lower = extension.toLowerCase();
  return (
    CONVERSION_MATRIX.find((descriptor) =>
      descriptor.extensions.includes(lower),
    ) ?? CONVERSION_MATRIX.find((descriptor) => descriptor.category === 'text')!
  );
};


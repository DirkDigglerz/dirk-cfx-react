/**
 * Build-time helpers. Imported from a vite config, never from a NUI bundle -
 * this entry touches node:fs and would not survive in a browser.
 */
export {
  studioComponent,
  STUDIO_SHARED,
  type StudioComponentOptions,
  type StudioComponentProps,
} from './studioComponent';

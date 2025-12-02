/**
 * Downloads a Blob object as a file to the user's download folder.
 * @param blob - The Blob object to download
 * @param filename - The name of the file to download
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
};

/**
 * Determines the file extension based on the blob type.
 * @param blob - The Blob object to check
 * @returns The file extension (e.g., 'zip', 'js')
 */
export const getFileExtensionFromBlob = (blob: Blob): string => {
  const isZip = blob.type?.includes('zip');
  return isZip ? 'zip' : 'js';
};

/**
 * Generates a filename for a script download.
 * @param testCaseName - The name of the test case
 * @param blob - The Blob object to determine extension
 * @param fallback - Fallback filename if testCaseName is not provided
 * @returns The generated filename
 */
export const generateScriptFilename = (
  testCaseName: string | null | undefined,
  blob: Blob,
  fallback = 'script'
): string => {
  const ext = getFileExtensionFromBlob(blob);
  const baseName = testCaseName || fallback;
  return `${baseName}.${ext}`;
};

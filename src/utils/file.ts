export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        reject(new Error('No se pudo leer el archivo.'));
        return;
      }

      const base64 = result.split(',')[1];

      if (!base64) {
        reject(new Error('No se pudo convertir la imagen a Base64.'));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
}
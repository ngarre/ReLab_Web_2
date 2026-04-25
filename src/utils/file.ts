// Exporto una función reutilizable que recibe un archivo del navegador
// y devuelve una Promise con el contenido del archivo en formato Base64.
export function convertFileToBase64(file: File): Promise<string> {
 
  // Devuelvo una nueva Promise porque FileReader trabaja con eventos
  // (onload, onerror) y quiero envolverlo en una interfaz más cómoda
  // para poder usar "await" desde otros archivos.
  return new Promise((resolve, reject) => {
    
    // Creo una instancia de FileReader, que es una API del navegador
    // para leer el contenido de archivos seleccionados por el usuario.
    const reader = new FileReader();

    // Este bloque se ejecutará cuando la lectura del archivo termine bien.
    reader.onload = () => {

      // reader.result contiene el resultado de la lectura.
      // Según cómo se lea, puede venir en distintos formatos.
      const result = reader.result;

      // Compruebo que el resultado sea un string.
      // Si no lo es, rechazo la Promise con un error.
      if (typeof result !== 'string') {
        reject(new Error('No se pudo leer el archivo.'));
        return;
      }

      // Como el archivo se ha leído con readAsDataURL,
      // el resultado tendrá una forma parecida a:
      // "data:image/png;base64,iVBORw0KGgoAAA..."
      //
      // Al hacer split(',') separo:
      // [0] -> "data:image/png;base64"
      // [1] -> "iVBORw0KGgoAAA..."
      //
      // Me interesa solo la parte Base64, que es la posición [1].
      const base64 = result.split(',')[1];

      // Si por algún motivo no existe esa parte,
      // rechazo la Promise con un error.
      if (!base64) {
        reject(new Error('No se pudo convertir la imagen a Base64.'));
        return;
      }

      // Si todo va bien, resuelvo la Promise devolviendo
      // solo la cadena Base64.
      resolve(base64);
    };

    // Este bloque se ejecuta si ocurre un error al leer el archivo.
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));

    // Cuando ya he definido qué hacer si la lectura sale bien o mal,
    // INICIO la lectura del archivo como Data URL
    reader.readAsDataURL(file);
  });
}
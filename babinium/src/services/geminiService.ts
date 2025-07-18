import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TableData } from '../types';

const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
    throw new Error("La variable de entorno VITE_API_KEY no está configurada.");
}

const ai = new GoogleGenAI({ apiKey });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            const arrBuffer = new Uint8Array(reader.result as ArrayBuffer);
            const rawString = arrBuffer.reduce((data, byte) => data + String.fromCharCode(byte), '');
            resolve(btoa(rawString));
        }
    };
    reader.readAsDataURL(file);
  });
  const base64Data = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
};

export const extractTableFromImage = async (imageFile: File): Promise<TableData> => {
  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `Analiza la imagen proporcionada, que contiene una tabla de datos.
  Tu tarea es extraer meticulosamente toda la información de esta tabla y estructurarla como un JSON válido.
  El resultado debe ser un array JSON donde cada elemento del array es un objeto que representa una sola fila de la tabla.
  Utiliza las cabeceras de las columnas de la tabla como las claves para las propiedades en cada objeto de fila.
  Asegúrate de que los tipos de datos se infieran correctamente (por ejemplo, los números deben ser números, no cadenas de texto). Si una celda está vacía, represéntala como null o una cadena vacía.
  No incluyas ningún texto explicativo, comentarios o formato markdown en tu respuesta. La salida debe ser únicamente los datos JSON sin procesar.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
            { text: prompt },
            imagePart
        ]
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonText = response.text.trim();
    if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
        jsonText = jsonText.replace(/^```(json)?\s*|```\s*$/g, '').trim();
    }

    if (!jsonText) {
        throw new Error("Se recibió una respuesta vacía de la IA. Es posible que la imagen no contenga una tabla reconocible.");
    }

    const parsedData = JSON.parse(jsonText);

    if (!Array.isArray(parsedData)) {
      throw new Error("La respuesta de la IA no fue un array JSON. Por favor, inténtalo de nuevo.");
    }

    return parsedData as TableData;
    
  } catch (error) {
    console.error("Error procesando imagen con Gemini:", error);
    if (error instanceof SyntaxError) {
        throw new Error("La IA devolvió un formato de datos no válido. Es posible que la IA no haya podido identificar una tabla clara en la imagen.");
    }
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido con el servicio de IA.";
    throw new Error(errorMessage);
  }
};

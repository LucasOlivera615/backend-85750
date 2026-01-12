import fs from 'fs';

// 1- Crear y escribir contenido en un archivo.

fs.writeFileSync ('example.txt', 'Contenido inicial del archivo')

console.log('Archivo creado y contenido escrito.')

// 2- Leer el contenido del archivo.

const contenido = fs.readFileSync ('example.txt', 'utf8')

console.log('Contenido del archivo:', contenido)

// 3- Agregar contenido al archivo.

fs.appendFileSync('example.txt', '\nEste es el contenido nuevo agregado')

console.log('Contenido adicional agregado con éxito.')

// 4- Eliminar archivo.

fs.unlinkSync ('example.txt')

console.log('Archivo eliminado exitosamente.')
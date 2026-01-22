import express from 'express'
import ProductManager from './src/ProductManager.js'


const app = express()
const PORT = 8080
const manager = new ProductManager('./src/data/products.json')

const test = async () => {
  const products = await manager.getProducts()
  console.log(products)
}


app.get('/', (req, res) => {
    res.send('Servidor funcionando.')
})

app.listen(PORT, () => {
    console.log(`Servidor listo, corriendo en el puerto: ${PORT}`)
})

test()
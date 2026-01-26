import express from 'express'
import ProductManager from './managers/ProductManager.js'

const app = express()
const PORT = 8080
const manager = new ProductManager('./src/data/products.json')

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Servidor funcionando')
})

app.get('/api/products', async (req, res) => {
  const products = await manager.getProducts()
  res.json(products)
})

app.get('/api/products/:pid', async (req, res) => {
  const pid = Number(req.params.pid)
  const product = await manager.getProductById(pid)

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  res.json(product)
})

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = await manager.addProduct(req.body)
    res.status(201).json(newProduct)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.put('/api/products/:pid', async (req, res) => {

  const pid = Number(req.params.pid)

  const updatedProduct = await manager.updateProduct(pid, req.body)

  if (!updatedProduct) {
    return res.status(404).json( { error: 'Producto inexistente.' } )
  }

  res.json(updatedProduct)

})


app.delete('/api/products/:pid', async (req, res) => {
  const pid = Number(req.params.pid)
  const deleted = await manager.deleteProduct(pid)

  if (!deleted) {
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  res.json ( { message: 'Producto eliminado correctamente' } )
})

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`)
})
import express from 'express'
import ProductManager from './managers/ProductManager.js'
import CartManager from './managers/CartManager.js'

const app = express()
const PORT = 8080
const manager = new ProductManager('./src/data/products.json')
const cManager = new CartManager('./src/data/carts.json')

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

app.get('/api/carts/:cid', async (req, res) => {

  const cid = Number(req.params.cid)
  const cart = await cManager.getCartById(cid)

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' })
  }

  res.json(cart.products)

})

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = await manager.addProduct(req.body)
    res.status(201).json(newProduct)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/api/carts', async (req, res) => {

  try {

    const newCart = await cManager.createCart()
    res.status(201).json(newCart)

  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito' })
  }

})

app.post('/api/carts/:cid/product/:pid', async (req, res) => {

  const cid = Number(req.params.cid)
  const pid = Number(req.params.pid)

  const product = await manager.getProductById(pid)
  if (!product) {
    return res.status(404).json({ error: 'Producto no existe' })
  }

  const updatedCart = await cManager.addProductToCart(cid, pid)

  if (!updatedCart) {
    return res.status(404).json({ error: 'Carrito no encontrado' })
  }

  res.json(updatedCart)

})

app.put('/api/products/:pid', async (req, res) => {

  const pid = Number(req.params.pid)

  const updatedProduct = await manager.updateProduct(pid, req.body)

  if (!updatedProduct) {
    return res.status(404).json({ error: 'Producto inexistente.' })
  }

  res.json(updatedProduct)

})


app.delete('/api/products/:pid', async (req, res) => {
  const pid = Number(req.params.pid)
  const deleted = await manager.deleteProduct(pid)

  if (!deleted) {
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  res.json({ message: 'Producto eliminado correctamente' })
})

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`)
})
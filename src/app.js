import express from 'express'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import { Server } from 'socket.io'
import ProductManager from './managers/ProductManager.js'
import CartManager from './managers/CartManager.js'

const app = express()
const PORT = 8080
const manager = new ProductManager('./src/data/products.json')
const cManager = new CartManager('./src/data/carts.json')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

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

app.get('/home', async (req, res) => {
  const products = await manager.getProducts()
  res.render('home', { products })
})

app.get('/realtimeproducts', async (req, res) => {
  const products = await manager.getProducts()
  res.render('realTimeProducts', { products })
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

const server = http.createServer(app)
const io = new Server(server)

io.on('connection', async (socket) => {
  console.log('Cliente conectado.')

  const products = await manager.getProducts()
  socket.emit('products', products)

  socket.on('newProduct', async (productData) => {
    await manager.addProduct(productData)

    const updatedProducts = await manager.getProducts()

    io.emit('products', updatedProducts)
  })

  socket.on('deleteProduct', async (id) => {
    await manager.deleteProduct(id)

    const updatedProducts = await manager.getProducts()

    io.emit('products', updatedProducts)
  })
})

server.listen(PORT, () => {
  console.log(`Server escuchando en el puerto ${PORT}`)
})
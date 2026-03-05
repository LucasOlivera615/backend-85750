import express from 'express'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import dotenv from "dotenv"
import ProductManager from './managers/ProductManager.js'
import CartManager from './managers/CartManager.js'
import Product from './models/Producto.js'
import cartsRouter from './routes/carts.router.js'

dotenv.config()

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Mongo Atlas conectado")
  })
  .catch(error => {
    console.log("Error conectando Mongo:", error)
  })

const app = express()
const PORT = 8080
const manager = new ProductManager()
const cManager = new CartManager()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use("/api/carts", cartsRouter)
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  res.send('Servidor funcionando')
})

app.get('/api/products', async (req, res) => {

  const { limit = 10 } = req.query

  const result = await manager.getProducts(req.query)

  res.json({
    status: "success",
    payload: result.docs,
    totalPages: result.totalPages,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
    page: result.page,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}` : null,
    nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}` : null
  })

})

app.get('/api/products/:pid', async (req, res) => {
  const pid = req.params.pid
  const product = await manager.getProductById(pid)

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  res.json(product)
})

app.get('/api/carts/:cid', async (req, res) => {

  const cid = req.params.cid
  const cart = await cManager.getCartById(cid)

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' })
  }

  res.json(cart.products)

})

app.get('/home', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = 5

  const result = await Product.paginate({}, { page, limit })

  const products = result.docs.map(doc => doc.toObject())

  res.render('home', {
    products: products,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
    page: result.page,
    totalPages: result.totalPages
  })
})

app.get('/realtimeproducts', async (req, res) => {
  const result = await manager.getProducts({})
  res.render('realTimeProducts', { products: result.docs })
})

app.get('/carts/:cid', async (req, res) => {

  const { cid } = req.params

  const cart = await cManager.getCartById(cid)

  if (!cart) {
    return res.status(404).send("Carrito no encontrado")
  }

  res.render("cart", {
    products: cart.products.map(p => ({
      product: p.product.toObject(),
      quantity: p.quantity
    }))
  })

})

app.get('/products', async (req, res) => {

  const result = await manager.getProducts(req.query)

  // buscar un carrito existente
  let cart = await cManager.getCarts()

  if (!cart || cart.length === 0) {
    cart = await cManager.createCart()
  } else {
    cart = cart[0]
  }

  res.render('products', {
    products: result.docs,
    cartId: cart._id.toString(),
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
    page: result.page,
    totalPages: result.totalPages
  })

})

app.get('/products/:pid', async (req, res) => {

  const product = await manager.getProductById(req.params.pid)

  const productPlain = product.toObject()

  if (!product) {
    return res.status(404).send("Producto no encontrado")
  }

  let carts = await cManager.getCarts()

  let cart

  if (!carts || carts.length === 0) {
    cart = await cManager.createCart()
  } else {
    cart = carts[0]
  }

  res.render("productDetail", {
    product: productPlain,
    cartId: cart._id.toString()
  })

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

app.post('/api/carts/:cid/products/:pid', async (req, res) => {

  const cid = req.params.cid
  const pid = req.params.pid

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

  const pid = req.params.pid

  const updatedProduct = await manager.updateProduct(pid, req.body)

  if (!updatedProduct) {
    return res.status(404).json({ error: 'Producto inexistente.' })
  }

  res.json(updatedProduct)

})

app.delete('/api/products/:pid', async (req, res) => {
  const pid = req.params.pid
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

  const products = await manager.getProducts({})
  socket.emit('products', products.docs)

  socket.on('newProduct', async (productData) => {

    await manager.addProduct(productData)

    const updatedProducts = await manager.getProducts({})

    io.emit('products', updatedProducts.docs)
  })

  socket.on('deleteProduct', async (id) => {

    await manager.deleteProduct(id)

    const updatedProducts = await manager.getProducts({})

    io.emit('products', updatedProducts.docs)
  })
})

server.listen(PORT, () => {
  console.log(`Server escuchando en el puerto ${PORT}`)
})
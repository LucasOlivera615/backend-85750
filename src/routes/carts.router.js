import { Router } from "express"
import CartManager from "../managers/CartManager.js"

const router = Router()
const cartManager = new CartManager()

router.delete('/:cid/products/:pid', async (req, res) => {

    const { cid, pid } = req.params

    try {

        const cart = await cartManager.removeProductFromCart(cid, pid)

        res.json(cart)

    } catch (error) {

        res.status(500).json({ error: error.message })

    }

})

router.put('/:cid', async (req, res) => {

    const { cid } = req.params
    const { products } = req.body

    const cart = await cartManager.updateCart(cid, products)

    res.json(cart)

})

router.put('/:cid/products/:pid', async (req, res) => {

    const { cid, pid } = req.params
    const { quantity } = req.body

    const cart = await cartManager.updateProductQuantity(cid, pid, quantity)

    res.json(cart)

})

router.delete('/:cid', async (req, res) => {

    const { cid } = req.params

    const cart = await cartManager.clearCart(cid)

    res.json(cart)

})

export default router
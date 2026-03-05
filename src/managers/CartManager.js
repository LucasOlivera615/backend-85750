import Cart from "../models/Cart.js"

class CartManager {

    async createCart() {
        const newCart = new Cart({ products: [] })
        return await newCart.save()
    }

    async getCartById(id) {
        return await Cart.findById(id).populate("products.product")
    }

    async addProductToCart(cid, pid) {

        const cart = await Cart.findById(cid)
        if (!cart) return null

        const existingProduct = cart.products.find(
            p => p.product.toString() === pid
        )

        if (existingProduct) {
            existingProduct.quantity++
        } else {
            cart.products.push({
                product: pid,
                quantity: 1
            })
        }

        await cart.save()

        return cart
    }

    async removeProductFromCart(cid, pid) {

        const cart = await Cart.findById(cid)

        if (!cart) {
            throw new Error("Carrito no encontrado")
        }

        cart.products = cart.products.filter(
            p => p.product.toString() !== pid
        )

        return await cart.save()
    }

    async updateCart(cid, products) {

        const cart = await Cart.findByIdAndUpdate(
            cid,
            { products },
            { new: true }
        )

        return cart
    }

    async updateProductQuantity(cid, pid, quantity) {

        const cart = await Cart.findById(cid)

        const product = cart.products.find(
            p => p.product.toString() === pid
        )

        if (!product) {
            throw new Error("Producto no encontrado en el carrito")
        }

        product.quantity = quantity

        return await cart.save()
    }

    async clearCart(cid) {

        const cart = await Cart.findById(cid)

        cart.products = []

        return await cart.save()
    }

    async getCarts() {
        return await Cart.find()
    }

}

export default CartManager
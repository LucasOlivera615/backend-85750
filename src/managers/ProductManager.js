import fs from 'fs'

class ProductManager {

    constructor(path) {
        this.path = path
    }

    async getProducts() {
        try {

            const data = await fs.promises.readFile(this.path, 'utf-8')
            return JSON.parse(data)

        } catch (error) {

            return []

        }
    }

    async addProduct(product) {

        if (!product.title || !product.price) {
            throw new Error('Producto inválido, faltan datos.')
        }

        const products = await this.getProducts()

        const newId = products.length === 0 ? 1 : products[products.length - 1].id + 1

        const newProduct = {
            id: newId,
            ...product
        }

        products.push(newProduct)

        await fs.promises.writeFile(

            this.path,
            JSON.stringify(products, null, 2)

        )

        return newProduct
    }

    async getProductById(id) {
        const products = await this.getProducts()
        return products.find(p => p.id === id)
    }

    async deleteProduct(id) {
        const products = await this.getProducts()

        const productExists = products.some(p => p.id === id)

        if (!productExists) return false

        const updatedProducts = products.filter(p => p.id !== id)

        await fs.promises.writeFile(
            this.path,
            JSON.stringify(updatedProducts, null, 2)
        )

        return true

    }

    async updateProduct(id, data) {

        const products = await this.getProducts()

        const index = products.findIndex(p => p.id === id)

        if (index === -1) return null

        const updatedProduct = {
            ...products[index],
            ...data,
            id: products[index].id
        }

        products[index] = updatedProduct

        await fs.promises.writeFile(
            this.path,
            JSON.stringify(products, null, 2)
        )

        return updatedProduct

    }

}

export default ProductManager
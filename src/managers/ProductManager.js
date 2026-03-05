import Product from "../models/Producto.js"

class ProductManager {

    async getProducts(queryParams) {

        const { limit = 10, page = 1, sort, query } = queryParams

        const filter = {}

        if (query) {

            if (query === "available") {
                filter.stock = { $gt: 0 }
            } else {
                filter.category = query
            }

        }

        const options = {
            page: Number(page),
            limit: Number(limit),
            lean: true
        }

        if (sort) {
            options.sort = { price: sort === "asc" ? 1 : -1 }
        }

        return await Product.paginate(filter, options)

    }

    async addProduct(product) {

        if (!product.title || !product.price) {
            throw new Error('Producto inválido, faltan datos.')
        }

        const newProduct = new Product(product)
        return await newProduct.save()
    }

    async getProductById(id) {
        return await Product.findById(id)
    }

    async deleteProduct(id) {
        const deleted = await Product.findByIdAndDelete(id)
        return deleted ? true : false
    }

    async updateProduct(id, data) {
        return await Product.findByIdAndUpdate(
            id,
            data,
            { new: true }
        )
    }

}

export default ProductManager
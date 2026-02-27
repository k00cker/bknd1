// CartManager con Mongoose y soporte para populate de productos
const Cart = require('../db/Cart');

class CartManager {
  /**
   * Crear nuevo carrito
   */
  async createCart() {
    try {
      const newCart = new Cart({
        products: [],
      });

      const savedCart = await newCart.save();
      return savedCart.toObject();
    } catch (error) {
      console.error('Error en createCart:', error);
      throw error;
    }
  }

  /**
   * Obtener carrito por ID con productos completos (populate)
   */
  async getCartById(id) {
    try {
      // Validar que sea un ObjectId válido
      if (!this.isValidObjectId(id)) {
        throw new Error('ID de carrito inválido');
      }

      const cart = await Cart.findById(id).populate('products.product').lean();

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      return cart;
    } catch (error) {
      console.error('Error en getCartById:', error);
      throw error;
    }
  }

  /**
   * Agregar producto al carrito
   */
  async addProductToCart(cartId, productId) {
    try {
      // Validar IDs
      if (!this.isValidObjectId(cartId)) {
        throw new Error('ID de carrito inválido');
      }
      if (!this.isValidObjectId(productId)) {
        throw new Error('ID de producto inválido');
      }

      const cart = await Cart.findById(cartId);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Buscar si el producto ya existe en el carrito
      const existingProduct = cart.products.find(
        (p) => p.product.toString() === productId
      );

      if (existingProduct) {
        // Incrementar cantidad
        existingProduct.quantity += 1;
      } else {
        // Agregar nuevo producto
        cart.products.push({
          product: productId,
          quantity: 1,
        });
      }

      const updatedCart = await cart.save();
      await updatedCart.populate('products.product');
      return updatedCart.toObject();
    } catch (error) {
      console.error('Error en addProductToCart:', error);
      throw error;
    }
  }

  /**
   * Eliminar un producto específico del carrito
   */
  async removeProductFromCart(cartId, productId) {
    try {
      // Validar IDs
      if (!this.isValidObjectId(cartId)) {
        throw new Error('ID de carrito inválido');
      }
      if (!this.isValidObjectId(productId)) {
        throw new Error('ID de producto inválido');
      }

      const cart = await Cart.findById(cartId);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Filtrar el producto
      cart.products = cart.products.filter(
        (p) => p.product.toString() !== productId
      );

      const updatedCart = await cart.save();
      await updatedCart.populate('products.product');
      return updatedCart.toObject();
    } catch (error) {
      console.error('Error en removeProductFromCart:', error);
      throw error;
    }
  }

  /**
   * Actualizar la cantidad de un producto en el carrito
   */
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      // Validar IDs
      if (!this.isValidObjectId(cartId)) {
        throw new Error('ID de carrito inválido');
      }
      if (!this.isValidObjectId(productId)) {
        throw new Error('ID de producto inválido');
      }

      // Validar cantidad
      const quantityNum = parseInt(quantity);
      if (isNaN(quantityNum) || quantityNum < 1) {
        throw new Error('La cantidad debe ser un número mayor a 0');
      }

      const cart = await Cart.findById(cartId);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Buscar el producto
      const product = cart.products.find(
        (p) => p.product.toString() === productId
      );

      if (!product) {
        throw new Error('Producto no encontrado en el carrito');
      }

      // Actualizar cantidad
      product.quantity = quantityNum;

      const updatedCart = await cart.save();
      await updatedCart.populate('products.product');
      return updatedCart.toObject();
    } catch (error) {
      console.error('Error en updateProductQuantity:', error);
      throw error;
    }
  }

  /**
   * Actualizar todo el carrito con un array de productos
   */
  async updateCart(cartId, products) {
    try {
      // Validar ID del carrito
      if (!this.isValidObjectId(cartId)) {
        throw new Error('ID de carrito inválido');
      }

      // Validar que products sea un array
      if (!Array.isArray(products)) {
        throw new Error('Los productos deben ser un array');
      }

      // Validar cada producto en el array
      for (const item of products) {
        if (!item.product || !item.quantity) {
          throw new Error(
            'Cada producto debe tener "product" (ID) y "quantity"'
          );
        }
        if (!this.isValidObjectId(item.product)) {
          throw new Error(`ID de producto inválido: ${item.product}`);
        }
        if (parseInt(item.quantity) < 1) {
          throw new Error('La cantidad debe ser mayor a 0');
        }
      }

      // Actualizar carrito
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { products },
        { new: true, runValidators: true }
      ).populate('products.product');

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      return cart.toObject();
    } catch (error) {
      console.error('Error en updateCart:', error);
      throw error;
    }
  }

  /**
   * Eliminar todos los productos del carrito
   */
  async clearCart(cartId) {
    try {
      // Validar ID
      if (!this.isValidObjectId(cartId)) {
        throw new Error('ID de carrito inválido');
      }

      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { products: [] },
        { new: true }
      );

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      return cart.toObject();
    } catch (error) {
      console.error('Error en clearCart:', error);
      throw error;
    }
  }

  /**
   * Validar si es un ObjectId válido de MongoDB
   */
  isValidObjectId(id) {
    return String(id).match(/^[0-9a-fA-F]{24}$/) !== null;
  }
}

module.exports = CartManager;

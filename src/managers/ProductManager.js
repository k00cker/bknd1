// ProductManager con Mongoose y soporte para paginación, filtros y ordenamiento
const Product = require('../db/Product');

class ProductManager {
  /**
   * Obtener todos los productos con paginación, filtros y ordenamiento
   * @param {Object} options - Opciones de búsqueda
   * @param {number} options.limit - Cantidad de productos por página (default: 10)
   * @param {number} options.page - Número de página (default: 1)
   * @param {string} options.query - Filtro por categoría o disponibilidad
   * @param {string} options.sort - Ordenamiento: 'asc' o 'desc' por precio
   * @returns {Object} Objeto con información de paginación y productos
   */
  async getAllProducts(options = {}) {
    try {
      const { limit = 10, page = 1, query = '', sort = '' } = options;

      // Validar parámetros
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 10);

      // Construir filtro
      const filter = {};

      if (query) {
        // Buscar por categoría o disponibilidad
        if (query.toLowerCase() === 'disponible' || query.toLowerCase() === 'true') {
          filter.status = true;
        } else if (query.toLowerCase() === 'no disponible' || query.toLowerCase() === 'false') {
          filter.status = false;
        } else {
          // Buscar por categoría (case-insensitive)
          filter.category = { $regex: query, $options: 'i' };
        }
      }

      // Construir ordenamiento
      const sortOptions = {};
      if (sort === 'asc') {
        sortOptions.price = 1;
      } else if (sort === 'desc') {
        sortOptions.price = -1;
      }

      // Calcular skip para paginación
      const skip = (pageNum - 1) * limitNum;

      // Obtener total de documentos para paginación
      const totalProducts = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / limitNum);

      // Validar página
      if (pageNum > totalPages && totalProducts > 0) {
        return {
          status: 'success',
          payload: [],
          totalPages,
          prevPage: pageNum > 1 ? pageNum - 1 : null,
          nextPage: null,
          page: pageNum,
          hasPrevPage: pageNum > 1,
          hasNextPage: false,
          prevLink: pageNum > 1 ? `/api/products?page=${pageNum - 1}&limit=${limitNum}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}` : null,
          nextLink: null,
        };
      }

      // Obtener productos
      const products = await Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Construir respuesta
      const hasPrevPage = pageNum > 1;
      const hasNextPage = pageNum < totalPages;

      return {
        status: 'success',
        payload: products,
        totalPages,
        prevPage: hasPrevPage ? pageNum - 1 : null,
        nextPage: hasNextPage ? pageNum + 1 : null,
        page: pageNum,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage
          ? `/api/products?page=${pageNum - 1}&limit=${limitNum}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`
          : null,
        nextLink: hasNextPage
          ? `/api/products?page=${pageNum + 1}&limit=${limitNum}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`
          : null,
      };
    } catch (error) {
      console.error('Error en getAllProducts:', error);
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(id) {
    try {
      // Validar que sea un ObjectId válido
      if (!this.isValidObjectId(id)) {
        throw new Error('ID de producto inválido');
      }

      const product = await Product.findById(id).lean();
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      console.error('Error en getProductById:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo producto
   */
  async addProduct(productData) {
    try {
      // Validar campos requeridos
      const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
      for (const field of requiredFields) {
        if (!productData[field]) {
          throw new Error(`El campo "${field}" es obligatorio`);
        }
      }

      // Validar que el código sea único
      const existingProduct = await Product.findOne({ code: productData.code });
      if (existingProduct) {
        throw new Error(`Ya existe un producto con el código "${productData.code}"`);
      }

      // Crear nuevo producto
      const newProduct = new Product({
        title: productData.title,
        description: productData.description,
        code: productData.code,
        price: Number(productData.price),
        status: productData.status !== undefined ? productData.status : true,
        stock: Number(productData.stock),
        category: productData.category.toLowerCase(),
        thumbnails: productData.thumbnails || [],
      });

      const savedProduct = await newProduct.save();
      return savedProduct.toObject();
    } catch (error) {
      console.error('Error en addProduct:', error);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(id, updateData) {
    try {
      // Validar que sea un ObjectId válido
      if (!this.isValidObjectId(id)) {
        throw new Error('ID de producto inválido');
      }

      // No permitir actualizar el ID
      delete updateData._id;
      delete updateData.id;

      // No permitir actualizar el código (es único)
      delete updateData.code;

      // Convertir categoría a minúsculas si se incluye
      if (updateData.category) {
        updateData.category = updateData.category.toLowerCase();
      }

      // Convertir números
      if (updateData.price !== undefined) {
        updateData.price = Number(updateData.price);
      }
      if (updateData.stock !== undefined) {
        updateData.stock = Number(updateData.stock);
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();

      if (!updatedProduct) {
        throw new Error('Producto no encontrado');
      }

      return updatedProduct;
    } catch (error) {
      console.error('Error en updateProduct:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProduct(id) {
    try {
      // Validar que sea un ObjectId válido
      if (!this.isValidObjectId(id)) {
        throw new Error('ID de producto inválido');
      }

      const deletedProduct = await Product.findByIdAndDelete(id).lean();

      if (!deletedProduct) {
        throw new Error('Producto no encontrado');
      }

      return deletedProduct;
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los productos (sin paginación) - para cargar en memoria
   */
  async getProductsSync() {
    try {
      return await Product.find({}).lean();
    } catch (error) {
      console.error('Error en getProductsSync:', error);
      return [];
    }
  }

  /**
   * Validar si es un ObjectId válido de MongoDB
   */
  isValidObjectId(id) {
    return String(id).match(/^[0-9a-fA-F]{24}$/) !== null;
  }
}

module.exports = ProductManager;

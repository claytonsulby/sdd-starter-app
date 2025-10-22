/**
 * [Note] 
 * This is just an example to help prompt the model. 
 * This is from a different codebase.
 */
// import type { CreateCategoryInput, CreateCategoryResult } from '../../application-layer/use-cases/create-category';
// import type { DeleteCategoryInput, DeleteCategoryResult } from '../../application-layer/use-cases/delete-category';
// import type { EditCategoryInput, EditCategoryResult } from '../../application-layer/use-cases/edit-category';
// import type {
//   AddCategoryToProductInput,
//   AddCategoryToProductResult,
// } from '../../application-layer/use-cases/add-category-to-product';
// import type {
//   AddCategoryToProductsInput,
//   AddCategoryToProductsResult,
// } from '../../application-layer/use-cases/add-category-to-products';
// import type {
//   RemoveCategoryFromProductInput,
//   RemoveCategoryFromProductResult,
// } from '../../application-layer/use-cases/remove-category-from-product';
// import type {
//   RemoveCategoryFromProductsInput,
//   RemoveCategoryFromProductsResult,
// } from '../../application-layer/use-cases/remove-category-from-products';
// import type {
//   RemoveCategoryFromAllProductsInput,
//   RemoveCategoryFromAllProductsResult,
// } from '../../application-layer/use-cases/remove-category-from-all-products';
// import type { Metadata } from '../../domain-layer/entities/metadata';
// import { CategoryPort } from '../ports/category-port';
// import { MetadataPresenter } from '../presenter/metadata.presenter';
// import { ProductPresenter } from '../presenter/product.presenter';
// import { ProductsPresenter } from '../presenter/products.presenter';
// import type {
//   GetProductsInput,
//   GetProductsResult,
// } from '../../application-layer/use-cases/get-products';

// /**
//  * Controller responsible for category management operations.
//  * Orchestrates between use cases and presentation layer.
//  */
// export class CategoryController {
//   constructor(
//     private readonly port: CategoryPort,
//     private readonly metadataPresenter: MetadataPresenter,
//     private readonly productPresenter: ProductPresenter,
//     private readonly productsPresenter: ProductsPresenter
//   ) {}

//   async createCategory(input: CreateCategoryInput): Promise<CreateCategoryResult> {
//     const result = await this.port.createCategory(input);
//     const presentedResult = await this.metadataPresenter.present(result);
//     return presentedResult;
//   }

//   async deleteCategory(input: DeleteCategoryInput): Promise<DeleteCategoryResult> {
//     const result = await this.port.deleteCategory(input);
//     const presentedResult = await this.metadataPresenter.present(result);
//     return presentedResult;
//   }

//   async editCategory(input: EditCategoryInput): Promise<EditCategoryResult> {
//     const result = await this.port.editCategory(input);
//     const presentedMetadata = await this.metadataPresenter.present(result.metadata);
//     const presentedProducts = await this.productsPresenter.present(result.updatedProducts);
//     return {
//       metadata: presentedMetadata,
//       updatedProducts: presentedProducts,
//     };
//   }

//   async addCategoryToProduct(
//     input: AddCategoryToProductInput,
//   ): Promise<AddCategoryToProductResult> {
//     const result = await this.port.addCategoryToProduct(input);
//     const presentedMetadata = await this.metadataPresenter.present(result.metadata);
//     const presentedProduct = await this.productPresenter.present(result.updatedProduct);
//     return {
//       metadata: presentedMetadata,
//       updatedProduct: presentedProduct
//     };
//   }

//   async addCategoryToProducts(
//     input: AddCategoryToProductsInput,
//   ): Promise<AddCategoryToProductsResult> {
//     const result = await this.port.addCategoryToProducts(input);
//     const presentedMetadata = await this.metadataPresenter.present(result.metadata);
//     const presentedProducts = await this.productsPresenter.present(result.updatedProducts);
//     return {
//       metadata: presentedMetadata,
//       updatedProducts: presentedProducts
//     };
//   }

//   async removeCategoryFromProduct(
//     input: RemoveCategoryFromProductInput,
//   ): Promise<RemoveCategoryFromProductResult> {
//     const result = await this.port.removeCategoryFromProduct(input);
//     const presentedMetadata = await this.metadataPresenter.present(result.metadata);
//     const presentedProduct = await this.productPresenter.present(result.updatedProduct);
//     return {
//       metadata: presentedMetadata,
//       updatedProduct: presentedProduct
//     };
//   }

//   async removeCategoryFromProducts(
//     input: RemoveCategoryFromProductsInput,
//   ): Promise<RemoveCategoryFromProductsResult> {
//     const result = await this.port.removeCategoryFromProducts(input);
//     const presentedMetadata = await this.metadataPresenter.present(result.metadata);
//     const presentedProducts = await this.productsPresenter.present(result.updatedProducts);
//     return {
//       metadata: presentedMetadata,
//       updatedProducts: presentedProducts
//     };
//   }

//   async removeCategoryFromAllProducts(
//     input: RemoveCategoryFromAllProductsInput,
//   ): Promise<RemoveCategoryFromAllProductsResult> {
//     const result = await this.port.removeCategoryFromAllProducts(input);
//     const presentedMetadata = await this.metadataPresenter.present(result.metadata);
//     const presentedProducts = await this.productsPresenter.present(result.updatedProducts);
//     return {
//       metadata: presentedMetadata,
//       updatedProducts: presentedProducts
//     };
//   }

//   async getMetadata(): Promise<Metadata> {
//     const metadata = await this.port.getMetadata();
//     return this.metadataPresenter.present(metadata);
//   }

//   async getProducts(input?: GetProductsInput): Promise<GetProductsResult> {
//     const products = await this.port.getProducts(input);
//     return this.productsPresenter.present(products);
//   }
// }
export const example = true;
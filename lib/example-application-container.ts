/**
 * [Note] 
 * This is just an example to help prompt the model. 
 * This is from a different codebase.
 */
// import type { StripeClient } from './repository/clients/stripe-client';
// import { getStripeClient } from './repository/clients/stripe-client';
// import { StripeMetadataRepository } from './repository/stripe-metadata.repository';
// import { StripeProductRepository } from './repository/stripe-product.repository';
// import { CategoryAdapter } from './interface-layer/adapters/category.adapter';
// import { CategoryController } from './interface-layer/controllers/category.controller';
// import { MetadataPresenter } from './interface-layer/presenter/metadata.presenter';
// import { ProductPresenter } from './interface-layer/presenter/product.presenter';
// import { ProductsPresenter } from './interface-layer/presenter/products.presenter';

// /**
//  * Application Container - Responsible for dependency injection and wiring
//  * 
//  * This container follows the Composition Root pattern, centralizing all
//  * dependency configuration in one place. It ensures proper dependency
//  * injection while maintaining clean architecture boundaries.
//  */
// export class ApplicationContainer {
//   private readonly stripeClient: StripeClient;
//   private readonly stripeAccountId?: string | null;

//   // Repositories (Infrastructure Layer)
//   private _metadataRepository?: StripeMetadataRepository;
//   private _productRepository?: StripeProductRepository;

//   // Adapters (Interface Layer)
//   private _categoryAdapter?: CategoryAdapter;

//   // Presenters (Interface Layer)
//   private _metadataPresenter?: MetadataPresenter;
//   private _productPresenter?: ProductPresenter;
//   private _productsPresenter?: ProductsPresenter;

//   // Controllers (Interface Layer)
//   private _categoryController?: CategoryController;

//   constructor(options: { stripeAccountId?: string | null } = {}) {
//     this.stripeAccountId = options.stripeAccountId;
//     this.stripeClient = getStripeClient({ stripeAccountId: this.stripeAccountId });
//   }

//   /**
//    * Get or create the metadata repository instance
//    */
//   getMetadataRepository(): StripeMetadataRepository {
//     if (!this._metadataRepository) {
//       this._metadataRepository = new StripeMetadataRepository({
//         stripeAccountId: this.stripeAccountId,
//         stripeClient: this.stripeClient,
//       });
//     }
//     return this._metadataRepository;
//   }

//   /**
//    * Get or create the product repository instance
//    */
//   getProductRepository(): StripeProductRepository {
//     if (!this._productRepository) {
//       this._productRepository = new StripeProductRepository({
//         stripeAccountId: this.stripeAccountId,
//         stripeClient: this.stripeClient,
//       });
//     }
//     return this._productRepository;
//   }

//   /**
//    * Get or create the category adapter instance
//    */
//   getCategoryAdapter(): CategoryAdapter {
//     if (!this._categoryAdapter) {
//       this._categoryAdapter = new CategoryAdapter(
//         this.getMetadataRepository(),
//         this.getProductRepository()
//       );
//     }
//     return this._categoryAdapter;
//   }

//   /**
//    * Get or create the metadata presenter instance
//    */
//   getMetadataPresenter(): MetadataPresenter {
//     if (!this._metadataPresenter) {
//       this._metadataPresenter = new MetadataPresenter();
//     }
//     return this._metadataPresenter;
//   }

//   /**
//    * Get or create the product presenter instance
//    */
//   getProductPresenter(): ProductPresenter {
//     if (!this._productPresenter) {
//       this._productPresenter = new ProductPresenter();
//     }
//     return this._productPresenter;
//   }

//   /**
//    * Get or create the products presenter instance
//    */
//   getProductsPresenter(): ProductsPresenter {
//     if (!this._productsPresenter) {
//       this._productsPresenter = new ProductsPresenter();
//     }
//     return this._productsPresenter;
//   }

//   /**
//    * Get or create the category controller instance
//    * This is the main entry point for category operations
//    */
//   getCategoryController(): CategoryController {
//     if (!this._categoryController) {
//       this._categoryController = new CategoryController(
//         this.getCategoryAdapter(),
//         this.getMetadataPresenter(),
//         this.getProductPresenter(),
//         this.getProductsPresenter()
//       );
//     }
//     return this._categoryController;
//   }

//   /**
//    * Reset all cached instances - useful for testing
//    */
//   reset(): void {
//     this._metadataRepository = undefined;
//     this._productRepository = undefined;
//     this._categoryAdapter = undefined;
//     this._metadataPresenter = undefined;
//     this._productPresenter = undefined;
//     this._productsPresenter = undefined;
//     this._categoryController = undefined;
//   }
// }

// /**
//  * Default container instance for the application
//  * This can be imported and used throughout the application
//  */
// export const defaultContainer = new ApplicationContainer();
export const example = true;
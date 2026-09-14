import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BusinessStatus, ProductStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateInventoryDto } from './dto/update-inventory.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { randomUUID } from 'crypto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto.js';
import { SearchProductsDto } from './dto/search-products.dto.js';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatus(
    productId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateProductStatusDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        businessLocation: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      userRole !== UserRole.ADMIN &&
      product.businessLocation.business.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this product status',
      );
    }

    if (
      dto.status === ProductStatus.ACTIVE &&
      product.businessLocation.business.status !== 'ACTIVE'
    ) {
      throw new ForbiddenException(
        'Product cannot be activated while the business is not active',
      );
    }

    const lifecycle = dto.status === ProductStatus.ACTIVE
      ? this.lifecycleDates(new Date())
      : {};

    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: dto.status,
        ...lifecycle,
      },
      include: {
        category: true,
        inventory: true,
        businessLocation: {
          include: {
            business: true,
          },
        },
      },
    });
  }

  async create(userId: string, userRole: UserRole, dto: CreateProductDto) {
    const location = await this.prisma.businessLocation.findUnique({
      where: {
        id: dto.businessLocationId,
      },
      include: {
        business: true,
      },
    });

    if (!location) {
      throw new NotFoundException('Business location not found');
    }

    if (userRole !== UserRole.ADMIN && location.business.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to add products to this location',
      );
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: dto.categoryId,
        },
      });

      if (!category || !category.isActive) {
        throw new NotFoundException('Category not found');
      }
    }

    const slug = this.createSlug(dto.name);

    const lifecycle = location.business.status === BusinessStatus.ACTIVE
      ? this.lifecycleDates(new Date())
      : {};

    return this.prisma.product.create({
      data: {
        businessLocationId: dto.businessLocationId,
        categoryId: dto.categoryId,
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        sku: dto.sku?.trim() || null,
        currencyCode: dto.currencyCode.trim().toUpperCase(),
        price: dto.price,
        status: 'DRAFT',
        ...lifecycle,
        inventory: {
          create: {
            quantity: dto.quantity,
            isInStock: dto.quantity > 0,
          },
        },
      },
      include: {
        category: true,
        inventory: true,
        businessLocation: {
          include: {
            business: true,
          },
        },
      },
    });
  }

  async renew(productId: string, userId: string, userRole: UserRole) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { businessLocation: { include: { business: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (userRole !== UserRole.ADMIN && product.businessLocation.business.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to renew this product');
    }
    if (product.businessLocation.business.status !== BusinessStatus.ACTIVE) {
      throw new ForbiddenException('The business must be active before renewing a product');
    }
    return this.prisma.product.update({
      where: { id: productId },
      data: { status: ProductStatus.ACTIVE, ...this.lifecycleDates(new Date()) },
      include: { category: true, inventory: true, businessLocation: { include: { business: true } } },
    });
  }

  async findMyProducts(userId: string) {
    return this.prisma.product.findMany({
      where: {
        businessLocation: {
          business: {
            ownerId: userId,
          },
        },
      },
      include: {
        category: true,
        inventory: true,
        businessLocation: {
          include: {
            business: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

 async findById(id: string) {
  await this.expireProducts();
  const product = await this.prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      inventory: true,
      businessLocation: {
        include: {
          business: true,
        },
      },
    },
  });

  if (!product) {
    throw new NotFoundException('Product not found');
  }

  // Customers can only view active products
  // from active businesses.
  if (
    product.status !== ProductStatus.ACTIVE ||
    !product.expiresAt ||
    product.expiresAt <= new Date() ||
    product.businessLocation.business.status !== BusinessStatus.ACTIVE
  ) {
    throw new NotFoundException('Product not found');
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    sku: product.sku,
    price: Number(product.price),
    currencyCode: product.currencyCode,
    status: product.status,

    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,

    inventory: {
      quantity: product.inventory?.quantity ?? 0,
      isInStock: product.inventory?.isInStock ?? false,
    },

    business: {
      id: product.businessLocation.business.id,
      name: product.businessLocation.business.name,
      slug: product.businessLocation.business.slug,
      description:
        product.businessLocation.business.description,
    },

    location: {
      id: product.businessLocation.id,
      name: product.businessLocation.name,
      addressLine1:
        product.businessLocation.addressLine1,
      addressLine2:
        product.businessLocation.addressLine2,
      city: product.businessLocation.city,
      state: product.businessLocation.state,
      postalCode:
        product.businessLocation.postalCode,
      countryCode:
        product.businessLocation.countryCode,
      latitude:
        Number(product.businessLocation.latitude),
      longitude:
        Number(product.businessLocation.longitude),
    },

    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

  async update(
    productId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateProductDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        businessLocation: {
          include: {
            business: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      userRole !== UserRole.ADMIN &&
      product.businessLocation.business.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this product',
      );
    }

    if (dto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: dto.categoryId,
        },
      });

      if (!category || !category.isActive) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim(),
        }),
        ...(dto.sku !== undefined && {
          sku: dto.sku.trim(),
        }),
        ...(dto.currencyCode !== undefined && {
          currencyCode: dto.currencyCode.trim().toUpperCase(),
        }),
        ...(dto.price !== undefined && {
          price: dto.price,
        }),
        ...(dto.categoryId !== undefined && {
          categoryId: dto.categoryId,
        }),
      },
      include: {
        category: true,
        inventory: true,
        businessLocation: {
          include: {
            business: true,
          },
        },
      },
    });
  }

  async updateInventory(
    productId: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateInventoryDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        businessLocation: {
          include: {
            business: true,
          },
        },
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      userRole !== UserRole.ADMIN &&
      product.businessLocation.business.ownerId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this product inventory',
      );
    }

    return this.prisma.inventory.upsert({
      where: {
        productId,
      },
      update: {
        quantity: dto.quantity,
        isInStock: dto.quantity > 0,
      },
      create: {
        productId,
        quantity: dto.quantity,
        isInStock: dto.quantity > 0,
      },
    });
  }

  async search(dto: SearchProductsDto) {
    await this.expireProducts();
    const limit = dto.limit ?? 20;
    const page = dto.page ?? 1;

    const hasLocation =
      dto.latitude !== undefined &&
      dto.longitude !== undefined &&
      dto.radiusKm !== undefined;

    const products = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        expiresAt: { gt: new Date() },

        businessLocation: {
          business: {
            status: BusinessStatus.ACTIVE,
          },

          ...(dto.city && {
            city: {
              equals: dto.city.trim(),
              mode: 'insensitive',
            },
          }),
        },

        ...(dto.q && {
          name: {
            contains: dto.q.trim(),
            mode: 'insensitive',
          },
        }),

        ...(dto.minPrice !== undefined || dto.maxPrice !== undefined
          ? {
              price: {
                ...(dto.minPrice !== undefined && {
                  gte: dto.minPrice,
                }),
                ...(dto.maxPrice !== undefined && {
                  lte: dto.maxPrice,
                }),
              },
            }
          : {}),

        ...(dto.categoryId && {
          categoryId: dto.categoryId,
        }),
      },

      include: {
        category: true,
        inventory: true,
        businessLocation: {
          include: {
            business: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: hasLocation ? Math.min(100, limit * page) : limit,
      skip: hasLocation ? 0 : (page - 1) * limit,
    });

    const mapProduct = (
      product: (typeof products)[number],
      distanceKm?: number,
    ) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      price: Number(product.price),
      currencyCode: product.currencyCode,
      status: product.status,

      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,

      inventory: {
        quantity: product.inventory?.quantity ?? 0,
        isInStock: product.inventory?.isInStock ?? false,
      },

      business: {
        id: product.businessLocation.business.id,
        name: product.businessLocation.business.name,
        slug: product.businessLocation.business.slug,
        description: product.businessLocation.business.description,
      },

      location: {
        id: product.businessLocation.id,
        name: product.businessLocation.name,
        addressLine1: product.businessLocation.addressLine1,
        addressLine2: product.businessLocation.addressLine2,
        city: product.businessLocation.city,
        state: product.businessLocation.state,
        postalCode: product.businessLocation.postalCode,
        countryCode: product.businessLocation.countryCode,
        latitude: Number(product.businessLocation.latitude),
        longitude: Number(product.businessLocation.longitude),
      },

      ...(distanceKm !== undefined && {
        distanceKm,
      }),
    });

    if (!hasLocation) {
      return products.map((product) => mapProduct(product));
    }

    const latitude = dto.latitude!;
    const longitude = dto.longitude!;
    const radiusKm = dto.radiusKm!;

    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const filteredProducts = products
      .map((product) => {
        const productLatitude = Number(product.businessLocation.latitude);

        const productLongitude = Number(product.businessLocation.longitude);

        const earthRadiusKm = 6371;

        const latitudeDifference = toRadians(productLatitude - latitude);

        const longitudeDifference = toRadians(productLongitude - longitude);

        const a =
          Math.sin(latitudeDifference / 2) ** 2 +
          Math.cos(toRadians(latitude)) *
            Math.cos(toRadians(productLatitude)) *
            Math.sin(longitudeDifference / 2) ** 2;

        const distanceKm =
          earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return {
          product,
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((item) => item.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);

    return filteredProducts.map((item) =>
      mapProduct(item.product, item.distanceKm),
    );
  }
  private createSlug(name: string) {
    const baseSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `${baseSlug || 'product'}-${randomUUID().slice(0, 8)}`;
  }

  private lifecycleDates(publishedAt: Date) {
    const expiresAt = new Date(publishedAt);
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    return { publishedAt, expiresAt, expiredAt: null };
  }

  private async expireProducts() {
    await this.prisma.product.updateMany({
      where: { status: ProductStatus.ACTIVE, expiresAt: { lte: new Date() } },
      data: { status: ProductStatus.EXPIRED, expiredAt: new Date() },
    });
  }
}

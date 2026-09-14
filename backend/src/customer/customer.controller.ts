import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AddressDto } from './dto/address.dto.js';
import { CartItemDto, UpdateCartItemDto } from './dto/cart-item.dto.js';
import { CustomerService } from './customer.service.js';

interface AuthRequest extends Request { user: { id: string } }

@Controller()
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Get('addresses') addresses(@Req() req: AuthRequest) { return this.service.listAddresses(req.user.id); }
  @Post('addresses') createAddress(@Req() req: AuthRequest, @Body() dto: AddressDto) { return this.service.createAddress(req.user.id, dto); }
  @Patch('addresses/:id') updateAddress(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: AddressDto) { return this.service.updateAddress(req.user.id, id, dto); }
  @Delete('addresses/:id') deleteAddress(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.deleteAddress(req.user.id, id); }

  @Get('favorites') favorites(@Req() req: AuthRequest) { return this.service.listFavorites(req.user.id); }
  @Post('favorites/products/:id') favoriteProduct(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.favoriteProduct(req.user.id, id); }
  @Delete('favorites/products/:id') removeFavoriteProduct(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.removeFavoriteProduct(req.user.id, id); }
  @Post('favorites/businesses/:id') favoriteBusiness(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.favoriteBusiness(req.user.id, id); }
  @Delete('favorites/businesses/:id') removeFavoriteBusiness(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.removeFavoriteBusiness(req.user.id, id); }

  @Get('cart') cart(@Req() req: AuthRequest) { return this.service.getCart(req.user.id); }
  @Post('cart/items') addCartItem(@Req() req: AuthRequest, @Body() dto: CartItemDto) { return this.service.addCartItem(req.user.id, dto); }
  @Patch('cart/items/:id') updateCartItem(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateCartItemDto) { return this.service.updateCartItem(req.user.id, id, dto); }
  @Delete('cart/items/:id') removeCartItem(@Req() req: AuthRequest, @Param('id') id: string) { return this.service.removeCartItem(req.user.id, id); }
  @Delete('cart') clearCart(@Req() req: AuthRequest) { return this.service.clearCart(req.user.id); }
}

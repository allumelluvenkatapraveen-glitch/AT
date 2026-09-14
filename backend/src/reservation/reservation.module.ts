import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ReservationController } from './reservation.controller.js';
import { ReservationService } from './reservation.service.js';

@Module({ imports: [AuthModule], controllers: [ReservationController], providers: [ReservationService] })
export class ReservationModule {}

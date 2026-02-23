import type { Role, DriverStatus, OrderStatus } from "./generated/prisma";

export type { Role, DriverStatus, OrderStatus };

export interface UserWithDriver {
  id: string;
  name: string;
  email: string;
  role: Role;
  driver?: DriverWithOrders | null;
  createdAt: Date;
}

export interface DriverWithUser {
  id: string;
  userId: string;
  phone: string;
  vehicle: string;
  status: DriverStatus;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    orders: number;
  };
}

export interface DriverWithOrders extends DriverWithUser {
  orders: OrderWithDriver[];
}

export interface OrderWithDriver {
  id: string;
  title: string;
  pickupAddress: string;
  deliveryAddress: string;
  memo: string | null;
  status: OrderStatus;
  driverId: string | null;
  driver?: DriverWithUser | null;
  createdAt: Date;
  updatedAt: Date;
}

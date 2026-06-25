import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUser = {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MUNICIPAL_ADMIN' | 'BARANGAY_USER';
  assignedBarangayId?: string | null;
};

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): CurrentUser => {
  return ctx.switchToHttp().getRequest().user;
});


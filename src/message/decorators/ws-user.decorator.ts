import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WsUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    return client.handshake.auth.userId;
  },
);

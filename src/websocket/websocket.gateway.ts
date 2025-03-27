import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ReadReceiptService } from 'src/read-receipt/read-receipt.service';

@WebSocketGateway({ cors: true })
export class WebSocketGatewayService {
  @WebSocketServer()
  server: Server;

  constructor(private readonly readReceiptService: ReadReceiptService) {}

  @SubscribeMessage('markRead')
  async handleReadReceipt(
    @MessageBody() data: { userId: string; messageId: string },
  ) {
    await this.readReceiptService.markAsRead(data.userId, data.messageId);
    this.server.emit('messageRead', data);
  }
}

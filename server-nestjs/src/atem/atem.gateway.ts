import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import WebSocket = require('ws');
import { AtemService } from './atem.service';

@WebSocketGateway(parseInt(process.env.WEBSOCKET_PORT) || 8080)
export class AtemGateway {
  constructor(private atemService: AtemService) {}

  @SubscribeMessage('announceConnectionState')
  handleAnnounceConnectionState(client: WebSocket) {
    this.atemService.onConnectionChange((connected) => {
      this.emitAtemConnectionUpdate(client, connected);
    });

    this.emitAtemConnectionUpdate(client, this.atemService.connected);
  }

  private emitAtemConnectionUpdate(socket: WebSocket, connected: boolean) {
    socket.send(
      JSON.stringify({
        type: 'atemConnectionUpdate',
        data: {
          connected: connected,
        },
      }),
    );
  }
}

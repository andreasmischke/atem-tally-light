import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import WebSocket = require('ws');
import { AtemTallyService, AtemTallyState } from './atem-tally.service';

@WebSocketGateway(parseInt(process.env.WEBSOCKET_PORT) || 8080)
export class AtemTallyGateway {
  constructor(private atemTallyService: AtemTallyService) {}

  @SubscribeMessage('announceTallyState')
  handleAnnounceTallyState(client: WebSocket) {
    this.atemTallyService.onTallyUpdate((tallies) => {
      this.emitAtemTallyUpdate(client, tallies);
    });
  }

  private emitAtemTallyUpdate(socket: WebSocket, tallies: AtemTallyState[]) {
    socket.send(
      JSON.stringify({
        type: 'atemTallyUpdate',
        data: tallies,
      }),
    );
  }
}

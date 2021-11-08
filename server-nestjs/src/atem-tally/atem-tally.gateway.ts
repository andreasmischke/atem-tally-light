import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { AtemTallyService, AtemTallyState } from './atem-tally.service';
import WebSocket = require('ws');

@WebSocketGateway(parseInt(process.env.WEBSOCKET_PORT) || 8080)
export class AtemTallyGateway {
  constructor(private atemTallyService: AtemTallyService) {}

  @SubscribeMessage('announceTallyState')
  handleAnnounceTallyState(client: WebSocket) {
    this.atemTallyService.onTallyUpdate((tallies) => {
      this.emitAtemTallyUpdate(client, tallies);
    });
    setTimeout(() => {
      this.emitAtemTallyUpdate(client, this.atemTallyService.tallyState);
    }, 150);
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

import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
@Injectable()
export class RabbitMQService {
  constructor(@Inject('logs') private readonly client: ClientProxy) {}
  public async send(pattern: string, data: any) {
    return this.client.send(pattern, data).toPromise();
  }
}

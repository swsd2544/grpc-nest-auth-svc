import { OnModuleInit, INestMicroservice } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestMicroservice) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

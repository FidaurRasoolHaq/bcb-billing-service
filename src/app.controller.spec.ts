import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('returns a hello message with a timestamp', () => {
      const result = appController.getHello();

      expect(result.message).toContain('Hello World');
      expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    });
  });
});

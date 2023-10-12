import { INestApplication } from '@nestjs/common';

export class ContextService {
  private static _context: INestApplication;

  static get context() {
    return this._context;
  }

  static set context(context: INestApplication) {
    this._context = context;
  }
}

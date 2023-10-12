import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { MAX_ROW_LIMIT, MIN_PAGE_NUMBER, UNBOUNDED_ROW_LIMIT } from '../utils/constants';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    const { page, limit } = request.query;

    let actualLimit;
    let actualPage;
    let offset;

    if (limit && limit == "none") { //SPECIAL CASE: remove pagination limitation
        actualLimit = UNBOUNDED_ROW_LIMIT;
        actualPage = MIN_PAGE_NUMBER;
        offset = 0;
    }
    else {
        actualLimit = limit ? Number(limit) : MAX_ROW_LIMIT;
        actualPage = page ? Math.max(Number(page), MIN_PAGE_NUMBER) : MIN_PAGE_NUMBER;
        offset = (actualPage - 1) * (actualLimit);
    }

    return {
        limit: actualLimit,
        offset
    }
  },
);

import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const User = createParamDecorator(
    (
        data: unknown,
        ctx: ExecutionContext
    ) => {
        const request = ctx.switchToHttp().getRequest();


        let userHeader = request.headers['x-auth'] || null
        let user = userHeader ? JSON.parse(userHeader) : null;
        if (user) {
            // user.organization = { _id: user.organizationId };
            // delete user.organizationId;
            user._id = user.id
        }

        return {
            ...user
        }
    }
)
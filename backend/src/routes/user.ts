import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign, verify } from 'hono/jwt';
import { signInput } from "@ayush_23/medium-common";
export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
    }
  }>();

userRouter.post('/signup', async (c)=>{
    const prisma = new PrismaClient({
        datasources: {
          db: {
            url: c.env.DATABASE_URL,
          },
        },
      }).$extends(withAccelerate());
    
      const body = await c.req.json();
    
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
        },
      });
    
      const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    
      return c.json({
        jwt: token,
      });
});
userRouter.post('/signin', async (c) => {
    try{const prisma = new PrismaClient({
        datasources: {
          db: {
            url: c.env.DATABASE_URL,
          },
        },
      }).$extends(withAccelerate());
    
      const body = await c.req.json();
    
      const user = await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });
    
      if (!user) {
        c.status(403);
        return c.json({ error: "user not found" });
      }
    
      const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    
      return c.json({
        jwt: token,
      });}catch(e){
        return c.json({
            message: "you are not logged in"
        })
      }
  });
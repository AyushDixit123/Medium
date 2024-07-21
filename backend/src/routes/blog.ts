import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { decode, sign, verify } from 'hono/jwt';

export const blogRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
    },
    Variables:{
        userId: any; //specifying that a userID will also be added to the context later
    }
  }>(); 

blogRouter.use('/*', async (c, next) => {
    const token = c.req.header("authorization") || "".split(" ")[1];
    const res = await  verify(token, c.env.JWT_SECRET)
    if (res) {
      c.set("userId",res.id);
      await next();
    } else {
      return c.text("error");
    } 
  });

blogRouter.post('/',async (c)=>{
    const prisma = new PrismaClient({
        datasources: {
          db: {
            url: c.env.DATABASE_URL,
          },
        },
      }).$extends(withAccelerate());
      const body = await c.req.json();
      const authorId = c.get("userId")
      const blog =  await prisma.post.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: String(authorId)
        } 
      })
      return c.json({
        id: blog.id
      })
})

blogRouter.put('/', async (c)=>{
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasources: {
          db: {
            url: c.env.DATABASE_URL,
          }
        },
      }).$extends(withAccelerate());
      const body = await c.req.json();
      const blog =  await prisma.post.update({
        where:{
            id: body.id
        },
        data:{
            title: body.title,
            content: body.content,
            authorId: String(authorId)
        } 
      })
       return c.json({
        id: blog.id
      })
})

blogRouter.get('/get/:id', async (c)=>{
    const prisma = new PrismaClient({
        datasources: {
          db: {
            url: c.env.DATABASE_URL,
          },
        },
      }).$extends(withAccelerate());
      const body = c.req.param('id');
      try{
        const blog = await prisma.post.findFirst({
            where:{
                id: String(body)
            }
        })
        return c.json({
            blog
        })
      }catch{
        return c.text('hi')
      }
})
//pagination
blogRouter.get('/bulk', async (c)=>{
    const prisma = new PrismaClient({
        datasources: {
          db: {
            url: c.env.DATABASE_URL,
          },
        },
      }).$extends(withAccelerate());
     const blogs = await prisma.post.findMany();

     return c.json({
        blogs
     })
})

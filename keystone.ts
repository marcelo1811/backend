import { ProductImage } from './schemas/ProductImage';
import { createAuth } from '@keystone-next/auth'
import { Product } from './schemas/Product';
import { User } from './schemas/User'
import 'dotenv/config'
import { config, createSchema } from '@keystone-next/keystone/schema'
import { createTestAccount } from 'nodemailer';
import { withItemData, statelessSessions } from '@keystone-next/keystone/session'
import { insertSeedData } from './seed-data';

const databaseUrl = process.env.DATABASE_URL //|| 'mongodb://localhost/keystone-sick-fits-tutorial'

const sessionConfig = {
    maxAge: 60 * 60 * 24 * 360, // how long they stay signed in?
    secret: process.env.COOKIE_SECRET,
}

const { withAuth } = createAuth({
    listKey: 'User',
    identityField: 'email',
    secretField: 'password',
    initFirstItem: {
        fields: ['name', 'email', 'password'],
        // TODO: add in initial roles here
    }
})

export default withAuth(config({
    server: {
        cors: {
            origin: [process.env.FRONTEND_URL],
            credentials: true,
        }
    },
    db: {
        adapter: 'mongoose',
        url: databaseUrl,
        async onConnect(keystone) {
            console.log('Connected to the database')
            if (process.argv.includes('--seed-data')) {
                await insertSeedData(keystone)
            }
        },
    },
    lists: createSchema({
        // schema items here
        User,
        Product,
        ProductImage,
    }),
    ui: {
        // TODO: change this for roles
        isAccessAllowed: ({ session }) => {
            return !!session?.data
        }
    },
    session: withItemData(statelessSessions(sessionConfig), {
        User: `id`,
    })
}))
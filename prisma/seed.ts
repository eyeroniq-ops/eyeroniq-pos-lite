const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
    const existingUser = await prisma.user.findFirst()
    if (existingUser) {
        console.log('Users already exist, skipping seed.')
        return
    }

    const hashedPassword = await bcrypt.hash('1234', 10)

    const user = await prisma.user.create({
        data: {
            email: 'admin@eyeroniq.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log(`Created user: ${user.email}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

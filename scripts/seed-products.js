
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const products = [
        { name: 'Corte de Cabello', price: 250, type: 'SERVICE', description: 'Corte básico para caballero' },
        { name: 'Barba Express', price: 150, type: 'SERVICE', description: 'Alineación y perfilado' },
        { name: 'Tinte Completo', price: 800, type: 'SERVICE', description: 'Coloración permanente' },
        { name: 'Mascarilla Facial', price: 300, type: 'SERVICE', description: 'Limpieza profunda' },
        { name: 'Gel Fijador', price: 120, type: 'PRODUCT', stock: 50, cost: 60 },
        { name: 'Cera Mate', price: 180, type: 'PRODUCT', stock: 30, cost: 90 },
        { name: 'Shampoo Anticaspa', price: 100, type: 'PRODUCT', stock: 40, cost: 40 },
        { name: 'Acondicionador', price: 100, type: 'PRODUCT', stock: 40, cost: 40 },
        { name: 'Aceite para Barba', price: 220, type: 'PRODUCT', stock: 20, cost: 100 },
        { name: 'Peine de Madera', price: 80, type: 'PRODUCT', stock: 100, cost: 20 },
    ]

    console.log('Seeding products...')
    for (const p of products) {
        await prisma.product.create({ data: p })
    }
    console.log('Done!')
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())

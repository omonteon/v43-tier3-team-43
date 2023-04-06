import { prismaClient } from '../../../lib/prisma';

const prisma = new prismaClient()

export default async function handle() {

}

export async function getAllUsers() {
    const users = await prisma.user.findMany()
    return {
        props: {
            users
        }
    }
}

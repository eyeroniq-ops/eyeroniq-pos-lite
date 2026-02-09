import { getUsers } from '@/actions/user'
import EmployeeManager from '@/components/EmployeeManager'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
    const users = await getUsers()
    return <EmployeeManager users={users} />
}

export let users: { id: string }[] = []


export function userJoin(id: string) {
    let user = { id }
    users.push(user)
    return user
}

export function getCurrentUser(id: string) {
    return users.find(user => user.id === id)
}

export function userLeave(id: string) {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1)
        return users.splice(index, 1)[0]
}

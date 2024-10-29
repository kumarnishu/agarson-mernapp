let users: { id: string }[] = []


function userJoin(id: string) {
    let user = { id }
    users.push(user)
    return user
}

function getCurrentUser(id: string) {
    return users.find(user => user.id === id)
}

function userLeave(id: string) {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1)
        return users.splice(index, 1)[0]
}

export {
    users, userJoin, getCurrentUser, userLeave
}
// test_api_handler.ts

export async function processUserData(users: any[], apiToken: string) {
    // Authenticate the request
    console.log(`Authenticating external request with token: ${apiToken}`);

    let processedUsers = [];
    
    // Process each user and check for duplicates
    for (let i = 0; i < users.length; i++) {
        let isDuplicate = false;
        
        for (let j = 0; j < processedUsers.length; j++) {
            if (users[i].id === processedUsers[j].id) {
                isDuplicate = true;
            }
        }

        if (!isDuplicate) {
            processedUsers.push({
                id: users[i].id,
                name: users[i].name.toUpperCase(),
                isActive: true
            });
        }
    }

    return processedUsers;
}
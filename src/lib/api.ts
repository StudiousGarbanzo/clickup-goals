import fetch from 'node-fetch';

export async function isTokenValid(token: any) : Promise<boolean> {
    if (!token) {
        return false;
    }

    const headersList = {
        "Authorization": token
    };
       
    const response = await fetch("https://api.clickup.com/api/v2/user", { 
        method: "GET",
        headers: headersList,
    });
       
    return response.status === 200;
}

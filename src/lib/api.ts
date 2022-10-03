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

export interface Goal {
    id: string,
    prettyId: string,
    name: string,
    color: string,
    description: string
}


export async function getTeams(token: any): Promise<string[]> {
    const teams: string[] = [];
    // TODO
    return teams;
}

export async function getGoals(token: any, teamId: number): Promise<Goal[]> {
    const goals: Goal[] = [];
    // TODO
    return goals;
}

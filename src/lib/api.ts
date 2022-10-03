import fetch from 'node-fetch';

export async function isTokenValid(token: any): Promise<boolean> {
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

export interface Team {
    id: string,
    name: string,
}

export async function getTeams(token: any): Promise<Team[]> {
    const teams: Team[] = [];
    let headersList = {
        "Authorization": token
    };

    let response = await fetch("https://api.clickup.com/api/v2/team", {
        method: "GET",
        headers: headersList
    });

    let data = JSON.parse(await response.text());
    for (const team of data.teams) {
        teams.push({
            id: team.id,
            name: team.name
        });
    }

    // TODO
    return teams;
}

export async function getGoals(token: string, teamId: string): Promise<Goal[]> {
    const goals: Goal[] = [];

    const resp = await fetch(
        `https://api.clickup.com/api/v2/team/${teamId}/goal`,
        {
            method: 'GET',
            headers: {
                "Authorization": token
            }
        }
    );

    const data = JSON.parse(await resp.text());
    
    for (const goal of data.goals) {
        const final: Goal = {
            id: goal.id,
            prettyId: goal.pretty_id,
            name: goal.name,
            description: goal.description,
            color: goal.color
        };
        goals.push(final);
    }
    return goals;
}

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
    description: string,
    dueDate: string,
    percentCompleted: number
}

export interface Team {
    id: string,
    name: string,
}

export async function updateGoal(token: any, goalId: string, name: string, desc: string, color: string, date: number): Promise<string> {
    let headersList = {
        "Content-Type": "application/json",
        "Authorization": token
    };
    const bodyJson = JSON.stringify({
        name: name,
        due_date: date,
        description: desc,
        rem_owners: [],
        add_owners: [],
        color: color
    });
    const resp = await fetch(`https://api.clickup.com/api/v2/goal/${goalId}`, {
        method: "PUT",
        headers: headersList,
        body: bodyJson
    });
    return `${resp.status} ${await resp.text()} ${bodyJson}`;
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
            color: goal.color,
            dueDate: goal.due_date,
            percentCompleted: goal.percent_completed,
        };
        goals.push(final);
    }
    return goals;
}

export async function getUserId(token: any): Promise<number> {
    let headersList = {
        "Authorization": token
    };
    const resp = await fetch(
        `https://api.clickup.com/api/v2/user`,
        {
            method: 'GET',
            headers: headersList
        }
    );
    return JSON.parse(await resp.text()).id;
}

export async function createGoal(token:any, teamId: string, name: string, dueDate: number, desc: string, userId: number, color: string): Promise<void> {
    let headersList = {
        "Content-Type": "application/json",
        "Authorization": token
    };
    await fetch(`https://api.clickup.com/api/v2/team/${teamId}/goal`, {
        method: "POST",
        headers: headersList,
        body: JSON.stringify({
            name: name,
            due_date: dueDate,
            description: desc,
            multiple_owners: true,
            owners: [userId],
            color: color,
        })
    });
}

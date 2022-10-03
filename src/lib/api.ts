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
    let headersList = {
        "Authorization": token
       }
       
       let response = await fetch("https://api.clickup.com/api/v2/team", { 
         method: "GET",
         headers: headersList
       });
       
       let data = JSON.parse(await response.text())
       let i = 0;
        for(let team: any = data.teams[i]; i < data.teams.length; i++) {
             teams.push(team.id);
        }
       
    // TODO
    return teams;
}

export async function getGoals(token: any, teamId: number): Promise<Goal[]> {
    const goals: Goal[] = [];
      
      const teamid = teamId;
      const resp = await fetch(
        `https://api.clickup.com/api/v2/team/${teamid}/goal`,
        {
          method: 'GET',
          headers: {
            Authorization: token
          }
        }
      );
      
      const data = await resp.text();
      const final: Goal = {
        id: data.id,
        prettyId: data.pretty_id,
        name: data.name,
        description: data.description,
        color: data.color
    };
    let i = 0;
        for(let goal: any = final; i < data.teams.length; i++) {
             goals.push(goal);
        }
    // TODO
    return goals;
}

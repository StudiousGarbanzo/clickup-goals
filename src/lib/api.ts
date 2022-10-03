import fetch from 'node-fetch';

export async function isTokenValid(token: string) : Promise<boolean> {
    const headersList = {
        "Authorization": token
       };
       
       const response = await fetch("https://api.clickup.com/api/v2/user", { 
         method: "GET",
         headers: headersList,
      });
       
       if (response.status === 200)
         {
            return true;
            }
        else {
            return false;
            }
}

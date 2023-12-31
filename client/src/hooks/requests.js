const API_URL = `http://localhost:8000/v1`;

 // Load planets and return as JSON.
async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets`);
  return await response.json();  
  // Load planets and return as JSON. 
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
 const response = await fetch(`${API_URL}/launches`);
 const fetchesLaunches = await response.json();
 return fetchesLaunches.sort( (a,b)=>{
  return a.flightNumber - b.flightNumber;
}); 
}
 // Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try{
    return await fetch(`${API_URL}/launches`,{
      method:"post",
      headers:{
        "Content-type":"application/json"
      },
      body: JSON.stringify(launch) 
    })
  }catch(err){
    return {
      ok:false,
    };
  }  
}
// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    return await fetch(`${API_URL}/launches/${id}`,{
      method:"delete",
    });
  } catch (err) {
    console.log(err);
    return {
      ok:false,
    }
  }
  
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};
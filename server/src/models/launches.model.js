const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches(){
    console.log("Downloading launch data...");
  const response = await axios.post(SPACEX_API_URL, {
    querry: {},
    options: {
      pagination:false,  
      populate: [
        {
          path: "rocket",
          select: {
            name: 1
          },
        },
        {
          path: "payloads", //this is a collection name in the Nasa database
          select:{
            customers:1
          }
        },
      ],
    },
  });

  if(response.status !== 200){
    console.log('problem downloading launch data');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs
  for(const launchDoc of launchDocs){
    const payload= launchDoc['payloads'];
    const customers = payload.flatMap((payload) =>{  //2 array var. array of array için
        return payload['customers'];
    })

    //maping lauch data in Nasa API to our database
    const launch = {
        flightNumber:launchDoc['flight_number'],
        mission:launchDoc['name'],
        rocket:launchDoc['rocket'] ['name'],
        launchDate:launchDoc['date_local'],
        upcoming:launchDoc['upcoming'],
        success:launchDoc['success'],
        customers,
    }
   
    await saveLaunch(launch);
  }
}

async function laodLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber:1,
    rocket:'Falcon 1',
    mission:'FalconSat',
  });  
  if(firstLaunch){
    console.log('Launch data already loaded');    
  } else { //if there are no launch our database then populate
    await populateLaunches();
  } 
}

//I want to checkout if launch exist or not
async function findLaunch(filter){
    return await launchesDatabase.findOne(filter);
}

async function existLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase
  .findOne()
  .sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip,limit) {
  return await launchesDatabase
  .find({}, { _id: 0, __v: 0 })
  .sort({ flightNumber:1 })
  .skip(skip)
  .limit(limit);
}

async function saveLaunch(launch) { 
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {   
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error("No matching planet found");
  }
  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero to Mastery", "NASA"],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.ok === 1 && aborted.nModified === 1;
}

module.exports = {
  laodLaunchData,
  existLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};

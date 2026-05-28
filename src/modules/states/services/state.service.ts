import axios from "axios";
import { AppError } from "@common/errors/appErrors.js";
import { HttpStatus } from "@common/enums/StatusCodes.js";
const COUNTRY_API_KEY = process.env.COUNTRY_API_KEY as string;

export const getAllStatesService = async () => {
  try {
    const response = await axios.get(
      "https://naija-places.toneflix.com.ng/api/v1/states",
      {
        headers: {
          "X-Api-Key": COUNTRY_API_KEY,
        },
      },
    );
    const data = response.data.data;
    return data.map((state : any) => ({ id : state.id, name: state.name, iso: state.iso2}));
  } catch (error) {
    throw new AppError("Failed to fetch states", HttpStatus.ServerError);
  }
};
export const getAllStateLGAService = async (stateIso: string) => {
  try {
    const response = await axios.get(
      `https://naija-places.toneflix.com.ng/api/v1/states/${stateIso}/lgas`,
      {
        headers: {
          "X-Api-Key": COUNTRY_API_KEY,
        },
      },
    );
    const data = response.data.data;
    return data.map((data: any) => ({
      id: data.id,
      name: data.name,
      state: data.state,
    }));
  } catch (error) {
    throw new AppError("Failed to fetch LGA data", HttpStatus.ServerError);
  }
};

// import * as fs from 'fs';
// import * as path from 'path';
// import { NigeriaState } from 'modules/interfaces/State';

// const nigeriaData = JSON.parse(
//   fs.readFileSync(path.join(__dirname, '../utils/nigeria.json'), 'utf-8')
// );

// export const getAllStates = ():NigeriaState[] => {
//   return nigeriaData.map((state: any, index: number) => ({
//     id: index + 1,
//     state: state.state,
//     alias: state.alias,
//     lgas: state.lgas.map((lga: string, lgaIndex: number) => ({
//       id: lgaIndex + 1,
//       name: lga
//     }))
//   }));
// };

// export const getStateById = (id: number) => {
//   const state = nigeriaData[id - 1];
//   if (!state) return null;
//   return {
//     id: id,
//     state: state.state,
//     alias: state.alias,
//     lgas: state.lgas.map((lga: string, lgaIndex: number) => ({
//       id: lgaIndex + 1,
//       name: lga
//     }))
//   };
// };
// export const getStateByName = (stateName: string): any => {
//   const state = nigeriaData.find((s: NigeriaState) => s.state.toLowerCase() === stateName.toLowerCase());

//   if (!state) {
//     throw new Error(`State ${stateName} not found`);
//   }

//   return {
//     id: nigeriaData.findIndex((s: NigeriaState) => s.state.toLowerCase() === stateName.toLowerCase()) + 1,
//     state: state.state,
//     alias: state.alias,
//     lgas: state.lgas.map((lga: string, lgaIndex: number) => ({
//       id: lgaIndex + 1,
//       name: lga
//     }))
//   };
// };

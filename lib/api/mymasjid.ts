import { Country, ApiResponse, City, Masjid, PublicFilteredMasjidResponse, OneWeekTimingsModel } from "../model/mm.model";
import api from "./api";

export async function getListCountries(): Promise<Country[]> {
  try {
    const response: ApiResponse<Country[]> = await api.get('country/getallcountries');
    if (response.hasError) {
      console.error('API Error:', response.message, response.errors);
      throw new Error(response.message || 'Failed to fetch countries');
    }
    return response.model;
  } catch (err) {
    // handle or rethrow the error
    throw err;
  }
}

export async function getCitiesByCountryId(countryId: number): Promise<City[]> {
  try {
    const response: ApiResponse<City[]> = await api.get(
      `city/getcitiesbycountryid?countryId=${countryId}`
    );

    if (response.hasError) {
      throw new Error(response.message ?? "Failed to fetch cities");
    }

    return response.model; // return just the list of cities
  } catch (err) {
    throw err;
  }
}

export async function searchMasjidByLocation(
  countryId: number,
  cityId: number
): Promise<Masjid[]> {
  try {
    const response: ApiResponse<Masjid[]> = await api.get(
      `masjid/searchmasjidbylocation?CountryId=${countryId}&CityId=${cityId}`
    );

    if (response.hasError) {
      throw new Error(response.message ?? "Failed to fetch masajid");
    }

    return response.model;
  } catch (err) {
    throw err;
  }
}

export async function getPublicFilteredMasjid(
  searchParam: string,
  isPublished: number
): Promise<PublicFilteredMasjidResponse> {
  try {
    const response: ApiResponse<PublicFilteredMasjidResponse> = await api.get(
      `Masjid/GetPublicFilteredMasjid?searchParam=${searchParam}&isPublished=${isPublished}`
    );

    if (response.hasError) {
      throw new Error(response.message ?? "Failed to fetch filtered masjid list");
    }

    return response.model;
  } catch (err) {
    throw err;
  }
}

export async function getOneWeekMultiSalahTimings(
  day: number,
  month: number,
  guidId: string
): Promise<OneWeekTimingsModel> {
  try {
    const response: ApiResponse<OneWeekTimingsModel> = await api.get(
      `TimingsInfoScreen/OneWeekMultiSalahTimings?Day=${day}&Month=${month}&GuidId=${guidId}`
    );

    if (response.hasError) {
      throw new Error(response.message ?? "Failed to fetch salah timings");
    }

    return response.model;
  } catch (err) {
    throw err;
  }
}
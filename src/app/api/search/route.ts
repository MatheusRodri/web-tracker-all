import { NextResponse } from "next/server";

// Interfaces for OMDB Search results
export interface OMDBMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

// Interface for OMDB Search Response
export interface OMBSearchResponse {
  Search?: OMDBMovie[];
  totalResults?: string;
  Response: "True" | "False";
  Error?: string;
}

// Interface for OMDB Detail Response
export interface OMBDetailResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  totalSeasons?: string;
  Production?: string;
  Response: "True" | "False";
  Error?: string;
}

/**
 * GET request handler for OMDB proxy route.
 * Handles movie/show searches and detailed lookups based on query parameters.
 * Prevents exposing the OMDB API key to the client side.
 *
 * @param request - Next.js Request object containing URL parameters
 * @returns A JSON NextResponse containing the OMDB data or error status
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("s");
  const id = searchParams.get("i");
  const type = searchParams.get("type");

  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OMDB API key is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    let url = "";

    if (id) {
      // Fetch details by imdbID
      url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${id}&plot=full`;
    } else if (search) {
      // Search movies/series by query string
      url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(search)}`;
      if (type) {
        url += `&type=${encodeURIComponent(type)}`;
      }
    } else {
      return NextResponse.json(
        { error: "Missing query parameters. Please provide 's' for search or 'i' for detailed view." },
        { status: 400 }
      );
    }

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from OMDB API: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Log exception for debugging on server-side
    console.error("OMDB Fetch Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching data." },
      { status: 500 }
    );
  }
}

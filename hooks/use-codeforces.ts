import { useState, useEffect } from 'react';

interface CFRatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

interface CFSubmission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: {
    contestId: number;
    index: string;
    name: string;
    type: string;
    rating?: number;
    tags: string[];
  };
  author: {
    contestId: number;
    members: { handle: string }[];
    participantType: string;
    ghost: boolean;
    startTimeSeconds: number;
  };
  programmingLanguage: string;
  verdict: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

interface CFResponse<T> {
  status: string;
  result: T;
  comment?: string;
}

export function useCFRating(handle: string) {
  const [data, setData] = useState<CFRatingChange[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    fetch(`https://codeforces.com/api/user.rating?handle=${handle}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch rating');
        return res.json();
      })
      .then((json: CFResponse<CFRatingChange[]>) => {
        if (json.status !== 'OK') throw new Error(json.comment || 'API Error');
        if (isMounted) {
          setData(json.result);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching CF rating:', error);
        if (isMounted) {
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [handle]);

  return { data, isLoading, isError };
}

export function useCFSubmissions(handle: string) {
  const [data, setData] = useState<CFSubmission[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    fetch(`https://codeforces.com/api/user.status?handle=${handle}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch status');
        return res.json();
      })
      .then((json: CFResponse<CFSubmission[]>) => {
        if (json.status !== 'OK') throw new Error(json.comment || 'API Error');
        if (isMounted) {
          setData(json.result);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching CF submissions:', error);
        if (isMounted) {
          setIsError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [handle]);

  return { data, isLoading, isError };
}

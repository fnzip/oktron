import { fetch } from "bun";

const fetchQueue: Array<{
  url: string;
  options: RequestInit;
  resolve: (value: Response | PromiseLike<Response>) => void;
  reject: (reason?: any) => void;
}> = [];
let activeRequests = 0;
const MAX_REQUESTS_PER_SECOND = 15;
const MAX_QUEUE_SIZE = 100; // Limit for the queue size
const REQUEST_INTERVAL = 1000 / MAX_REQUESTS_PER_SECOND; // Interval in milliseconds
const REQUEST_TIMEOUT = 5000; // Timeout for each request in milliseconds

// Function to perform fetch with a timeout
function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
}

// Function to process the fetch queue
function processQueue(): void {
  while (activeRequests < MAX_REQUESTS_PER_SECOND && fetchQueue.length > 0) {
    const { url, options, resolve, reject } = fetchQueue.shift()!;
    activeRequests++;

    // Perform the fetch request
    fetchWithTimeout(url, options)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      })
      .finally(() => {
        activeRequests--;
        setTimeout(processQueue, REQUEST_INTERVAL); // Wait before processing the next request
      });
  }
}

// Function to add a fetch request to the queue
export function throttledFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return new Promise((resolve, reject) => {
    if (fetchQueue.length >= MAX_QUEUE_SIZE) {
      reject(new Error("Request queue is full"));
      return;
    }
    fetchQueue.push({ url, options, resolve, reject });
    processQueue(); // Start processing the queue
  });
}

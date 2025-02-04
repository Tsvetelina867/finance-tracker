export const fetchRecurringTransactions = async (accountId, frequency = null, category = null) => {
  try {
    const token = localStorage.getItem('token');


    if (!token) {
      throw new Error('No token found'); // Ensure token is available
    }

    // Prepare the URL with query parameters
    let url = `http://localhost:8080/api/finance/recurring-transactions/${accountId}`;

    // Add optional filters to the URL if provided
    const params = new URLSearchParams();
    if (frequency) params.append('frequency', frequency);
    if (category) params.append('category', category);

    if (params.toString()) {
      url = `${url}/catch-up?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      credentials: 'include', // Include credentials (cookies)
    });


    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    // Attempt to parse the response body
    const data = await response.json();

    return data || []; // Return data or an empty array if no data is found
  } catch (error) {
    console.error('Error fetching recurring transactions:', error); // Log the error
    return []; // Return an empty array in case of an error
  }
};

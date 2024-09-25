

1. Membership verification with API calls.
If mongo only stores app related information, how is user membership verified with each request?

initially, the user will get a cookie with an empty membership, the frontend will display membership options based on the cookie assigned by the createUser method, which returns data from both postgres and mongo. If a user changes its membership, the endpoint can reassign the cookie as it updates postgres. So the frontend will display based on the cookie (with an option to restore purchases).

On the other hand, the backend will need to verify membership at the start of each request and increment tokens upon responses in postgres. For membership verification, caching can be added to take load off db.
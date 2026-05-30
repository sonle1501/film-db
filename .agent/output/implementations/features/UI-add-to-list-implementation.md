# Implementation Report: Add to List Functionality

## User's intent
The user wants to implement an "Add to List" feature where right-clicking on a movie element opens a context menu with an "Add to List" option. Clicking this option should open a form that displays all user lists. For the selected list, if the list's type is `MIXTURE`, the user can choose from various item states (`PLAN_TO_WATCH`, `WATCHING`, etc.); otherwise, the item state must match the list's type. This form must also include a text input for notes and call the `/api/v1/users/lists/{list-id}/item` API endpoint. 

## Results
- **API Client Update (`src/lib/api-client.ts`)**: Added the `addListItem` method to the `userApi` object to handle the POST request to `/api/v1/users/lists/{listId}/item`.
- **Add to List Modal (`src/components/features/movies/AddToListModal.tsx`)**: Created a new React component that:
  - Fetches and displays the user's lists using `userApi.getLists()`.
  - Dynamically renders the state dropdown depending on whether the selected list type is `MIXTURE`.
  - Captures optional notes.
  - Submits the correct payload via `userApi.addListItem`.
- **Movie Card Integration (`src/components/features/movies/MovieCard.tsx`)**: Updated the component to accept an `onContextMenu` prop, enabling right-click event handling.
- **Movies Page Integration (`src/app/(public)/movies/page.tsx`)**: Added state and event handlers for the custom context menu. Hooked up the `MovieCard` components to trigger the context menu, which in turn opens the `AddToListModal`.
- **Movie Details Page Integration (`src/app/(public)/movies/[id]/page.tsx`)**: Created a `MovieContextMenuWrapper` Client Component to wrap the poster image on the Server Component page, enabling the same right-click "Add to List" context menu and modal behavior seamlessly.

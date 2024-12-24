Create a react project that for AI chatbot.
1. Main ui page, it has:
- chat histiry list on the left hand side, take around 30% of the screen
- the right hand size is the main chat area, take around 70% of the screen
- the chat history list has the following fields:
  - use the first query of the chat in that session as the title for history list display
  - user click on the history item, the chat history will be displayed in the main chat area.
- the main chat area has the following fields:
  - the chat history will be displayed in the main chat area.
  - the chat input box is at the bottom of the screen.
  - the chat input box has a send button on the right hand side.
  - the chat input box has a clear button on the left hand side.
  - the chat input box has a voice input button on the left hand side.
  - the chat input box has a file input button on the left hand side.
  - the chat input box has a image input button on the left hand side.



  for each chat, a new session id will be generated, user id + session id will be used as the unique identifier for the chat session.
 
 the chat history can be obtained via api call to the backend, the api is /api/chat/histories, the method is get.
 the api will return a list of chat history, each chat history has the following fields:
  - user_id: the user id 
  - session_id: the session id
  - title: the short title of the chat history

  once user click on the history item, the chat history can be loaded via api call to the backend, the api is /api/chat/history/{user_id}/{session_id}, the method is get.
the api will return the chat history, each chat history has the following fields:
  - user_id: the user id 
  - session_id: the session id
  - messages:
    - request_id: the request id
    - user_input: the user input
    - response: the assistant response

on the each history item, there is a trash icon, click on it to delete the chat history.

go the chat input box, user can input the query, and click the send button to send the query to the backend via api call to the backend, the api is /api/chat/query, the method is post, the api spec is as follows:
 - user_id: the user id -- header
 - session_id: the session id -- header
 - request_id: the request id -- header
 - user_input: the user input
 - response: the assistant response


the main ui is protected by auth, user can only access the ui if they are authenticated., by default, use google oauth, after success login, display the user name in the top right corner. and there is a settings icon near the user name/avatar.

click on the settings icon, user can go to the settings page, the settings page has the following function:
 - Document index log management, user can view the document index log, and user can delete the document index log.
    - the index log is the log of the documents that are already pre-processed/embedded into vector database, or pending to be processed.
    - if delete a log, the log and the document trunks of it will be deleted from the vector database, this is very dangerous, so user need to confirm the deletion.
 - Chat history management, user can view the chat history, and user can delete the chat history.
 - System settings, user can view the system settings, and user can update the system settings.








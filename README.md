# Users Manual

## Command Lists
anything with a `_?_` should be considered optional  
Most options should be autofillable

* **join-as-host** -- _create a thread and join the list as a host_
    - parameters 
        ``` typescript
        * roomcode: string
        * platform: string
        * game: string
        * patchcards: boolean
        * format: string
        * region: string
        ```

* **join** -- _directand remove their room from the list_
    - parameters 
        ```typescript
        * roomcode: string
        ```

* **join-as-guest** -- _join the list as a guest looking for a host_
    - parameters
        ```typescript
        * platform: string
        * game: string
        * patchcards: boolean
        * format: string
        * region: string
        ```

* **leave** -- _remove yourself from the list_

* **list-rooms** -- _view rooms in the list_
    - parameters -- **filter options**
        ```typescript
        * platform?: string
        * game?: string
        * patchcards?: string
        * format?: string
        * region?: string
        ```

* **list-players** -- _view all players in the list_
* **list-hosts** -- _view all hosts in the list_
* **list-guests** -- _view all guests in the list_

### Coming Soon
* register -- _register for a tournament_
* get-registrants -- _see tournament participants_


Want to see how it all works? [Click here to go to the gitlab repository](https://gitlab.com/EnnisHam/mr-match/-/tree/main)
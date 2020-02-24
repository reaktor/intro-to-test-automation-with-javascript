# Intro to test automation with JavaScript

This is an exercise project to support an introductory workshop around writing automated unit and integration tests for a Node application, in JavaScript.

# Preparing for the workshop

Since you're reading this `README`, you've either cloned the project repository already or at least know where to get it. Once you have a fresh copy on your computer, do the following:

1. Install `node`
    - Either using a package manager: https://nodejs.org/en/download/package-manager/
    - Or going old school: https://nodejs.org/en/download/

2. Install the project's dependencies:
    ```
    $ npm install
    ```

3. Try to run the existing suite of tests:
    ```
    $ npm test
    ```
    If you see mentions of tests passing and no glaring errors, you're probably good to go!

    Having said that, you might want to confirm that the "application" starts up normally outside of the test harness as well:

4. Spin up the application server:
    ```
    $ npm start
    ```
    You should see a mention of `Express running` and `PORT 4000`.

# If you don't have anything else to do...

Feel free to browse the code that's already in place.

# References that might come handy

Since JavaScript tools' autocompletion is what it is, you'll probably find yourself perusing the API docs for your chosen assertion library more frequently than you'd like. Here's a menu of what we're already using in different parts of the project:

- Node's built-in `assert` module (used in a few sample tests):
    - https://nodejs.org/api/assert.html#assert_assert
- `chai` assertions (used in our unit tests):
    - https://www.chaijs.com/api/
- `jest` assertions (used in our integration tests):
    - https://jestjs.io/docs/en/using-matchers
    - https://jestjs.io/docs/en/expect
- `supertest` (used in our integration tests):
    - https://github.com/visionmedia/supertest

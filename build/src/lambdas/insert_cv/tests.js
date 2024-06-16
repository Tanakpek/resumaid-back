const handler = require("./insert_cv").handler;
const event = {
  "cv_object": {
    "name": "Tan Akpek",
    "title": "",
    "education": [
    {
      "institution": "Le Wagon",
      "location": "Barcelona, Spain",
      "degree": "Full Stack Web Development Bootcamp",
      "dissertation": null,
      "thesis": null,
      "dates": [
      "July 2022",
      "September 2022"],

      "score": null,
      "classification": null,
      "gpa": null
    }],

    "achievements_and_awards": [],
    "description": "",
    "projects": {
      "Clonebook": {
        "takeaways": [
        "Used docker-compose to define and build multi-container application and deployed on Amazon ECS.",
        "Implemented data stores with Redux to centralize state logic on React and Node.",
        "Designed and implemented MVC architecture with Node.js backend mapping objects onto MongoDB database with Mongoose.js; Managed secrets with JWTs by encrypting bearer tokens to verify OAuth credentials."]

      },
      "Wearables": {
        "takeaways": [
        "Coordinated group of three programmers in an agile environment using Trello, Slack and GitHub to deliver a functional product. Wrote product user stories and designed UI wireframe using Figma.",
        "Designed an MVC model and implemented it using Ruby on Rails while making use of APIs of services such as Stripe and MapBox, using AJAX in certain cases where dynamic re-rendering was needed.",
        "Implemented back-end CRUD and non-CRUD features using Active Record ORM and PostgreSQL.",
        "Wrote unit tests and set up a CI/CD pipeline with RSpec and GitHub Actions for Heroku deployments."]

      },
      "Ether Lottery": {
        "takeaways": [
        "Self-taught smart contract programming with solidity, developed a contract on remix and deployed smart contract on Göerli testnet using Truffle.",
        "Learned and used the web3.js library to enable users to read and write data to the Ethereum blockchain through the smart contract.",
        "Integrated smart contract with the Chainlink oracle service to enable smart contract to make use of non-deterministic processes."]

      }
    },
    "volunteer": [],
    "work": {
      "Beije": [
      {
        "role": "Frontend Developer",
        "dates": [
        "September 2022",
        "January 2023"],

        "takeaways": [
        "Worked in Agile environment with 3 other developers to develop features for new website of 30,000+ users by making data-driven decisions informed by metrics such as conversion rates from A/B tests sources from Google Analytics.",
        "Developed internal tools such as daily dashboards for KPIs, automated certain workloads for marketing team using third-party webhook management service Zapier.",
        "Promoted stronger component lifecycle practices by improving reusability and readability of legacy code.",
        "Performed testing and debugging of source code. Wrote more concise and thorough unit-tests while also reducing testing turnaround time by %30."]

      }],

      "Ernst and Young": [
      {
        "role": "Transaction Advisory Services Intern",
        "dates": [
        "June 2020",
        "August 2020"],

        "takeaways": [
        "Created cash flow of $344 million real estate project with three other interns dat.",
        "Saved project  repayment of $610Kdiscover and incorporat gov subsidies for ."]

      }]

    },
    "skills": [
    "Ruby on Rails",
    "React.js",
    "Node.js",
    "MongoDB",
    "SQL",
    "Docker",
    "Python",
    "HTML/CSS",
    "Git",
    "Solidity",
    "Google Cloud Platform",
    "Ansible"],

    "languages": [
    "English",
    "French (Intermediate)",
    "Turkish"],

    "professional_certifications": [
    "Google Cloud Associate Cloud Engineer",
    "Certified Solidity Developer"]

  },
  "user": "akpektan@gmail.com"
};
import { Flyway } from "node-flyway";


const flyway = new Flyway(
    {
        url:"jdbc:postgresql://localhost:5432/makeRepos",
        user:"postgres",
        password:"ubuntu",
        defaultSchema: "public",
        migrationLocations: ["src/migrations"]
    }
);


flyway.migrate().then(response => {
    if(!response.success) {
      throw new Error(`Unable to execute migrate command. Error: ${response.error.errorCode}`);
    }
    else {
	    console.log('flyway migrate response: ', response);
    }
});
